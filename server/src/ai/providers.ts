import { env } from '../env.js';
import { ANALYSIS_JSON_SCHEMA } from './prompt.js';

export interface ChatRequest {
  system?: string;
  user: string;
  /** data: URL or bare base64 — vision path */
  image?: string;
  /** Ask the provider to constrain output to ANALYSIS_JSON_SCHEMA */
  structured: boolean;
}

export interface ChatResult {
  text: string;
  provider: string;
  model: string;
  latencyMs: number;
}

const stripDataUrl = (image: string): string => {
  const match = image.match(/^data:([^;]+);base64,(.+)$/);
  if (match) return match[2];
  return image.includes(',') ? image.split(',')[1] : image;
};

/** Models wrap JSON in ``` fences often enough that this is not optional. */
export const extractJson = (text: string): unknown => {
  const cleaned = text.replace(/```json\n?|```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    // Last resort: grab the outermost {...} span
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start !== -1 && end > start) return JSON.parse(cleaned.slice(start, end + 1));
    throw new Error('Model did not return parseable JSON');
  }
};

// --- Ollama (local / offline) ----------------------------------------------

const ollamaChat = async (req: ChatRequest): Promise<ChatResult> => {
  const model = req.image ? env.ollama.visionModel : env.ollama.textModel;
  const started = Date.now();

  const body: Record<string, unknown> = {
    model,
    messages: [
      ...(req.system ? [{ role: 'system', content: req.system }] : []),
      {
        role: 'user',
        content: req.user,
        ...(req.image ? { images: [stripDataUrl(req.image)] } : {}),
      },
    ],
    stream: false,
    ...(req.structured ? { format: ANALYSIS_JSON_SCHEMA } : {}),
  };

  const send = (payload: Record<string, unknown>) =>
    fetch(`${env.ollama.url}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

  // Reasoning traces make hybrid models far too slow for interactive use; models that
  // reject the `think` parameter get one retry without it.
  let response = await send({ ...body, think: false });
  if (!response.ok) {
    const errText = await response.text();
    if (/think/i.test(errText)) {
      response = await send(body);
    } else {
      throw new Error(`Ollama error ${response.status}: ${errText}`);
    }
  }

  const data = (await response.json()) as { message?: { content?: string } };
  const text = data.message?.content;
  if (!text) throw new Error('Empty response from Ollama');

  return { text, provider: 'ollama', model, latencyMs: Date.now() - started };
};

// --- opencode.ai (hosted, OpenAI-compatible) --------------------------------

type StructuredMode = 'json_schema' | 'json_object' | 'none';

// Zen does not document structured-output support and it varies by underlying model, so
// we probe once per process and remember what the model actually accepted.
let negotiatedMode: StructuredMode | null = null;

const responseFormatFor = (mode: StructuredMode) => {
  if (mode === 'json_schema') {
    return {
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'analysis_result', schema: ANALYSIS_JSON_SCHEMA },
      },
    };
  }
  if (mode === 'json_object') return { response_format: { type: 'json_object' } };
  return {};
};

const opencodeChat = async (req: ChatRequest): Promise<ChatResult> => {
  const model = env.opencode.model;
  const started = Date.now();

  const content = req.image
    ? [
        { type: 'text', text: req.user },
        {
          type: 'image_url',
          image_url: {
            url: req.image.startsWith('data:')
              ? req.image
              : `data:image/jpeg;base64,${stripDataUrl(req.image)}`,
          },
        },
      ]
    : req.user;

  const call = async (mode: StructuredMode) => {
    const res = await fetch(`${env.opencode.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.opencode.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          ...(req.system ? [{ role: 'system', content: req.system }] : []),
          { role: 'user', content },
        ],
        ...(req.structured ? responseFormatFor(mode) : {}),
      }),
    });
    return res;
  };

  // Degrade gracefully: strict schema → json object → prompt-only.
  const ladder: StructuredMode[] = req.structured
    ? negotiatedMode
      ? [negotiatedMode]
      : ['json_schema', 'json_object', 'none']
    : ['none'];

  let lastError = '';
  for (const mode of ladder) {
    const res = await call(mode);
    if (res.ok) {
      if (req.structured) negotiatedMode = mode;
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const text = data.choices?.[0]?.message?.content;
      if (!text) throw new Error('Empty response from opencode');
      return { text, provider: 'opencode', model, latencyMs: Date.now() - started };
    }
    lastError = `${res.status} ${await res.text()}`;
    // Only a rejected response_format is worth retrying; auth/model errors are terminal.
    if (res.status !== 400 && res.status !== 422) break;
  }

  throw new Error(`opencode error: ${lastError}`);
};

export const chat = (req: ChatRequest): Promise<ChatResult> =>
  env.aiProvider === 'opencode' ? opencodeChat(req) : ollamaChat(req);

export const activeProvider = () => env.aiProvider;
export const negotiatedStructuredMode = () => negotiatedMode;

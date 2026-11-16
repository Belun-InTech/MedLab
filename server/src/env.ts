import 'dotenv/config';

const required = (key: string): string => {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env var: ${key} (see .env.example)`);
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  isProd: process.env.NODE_ENV === 'production',
  port: Number(process.env.API_PORT ?? 3001),

  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),

  // 'ollama' keeps the offline/on-device story; 'opencode' is the fast hosted path;
  // 'dr7' is the hosted medical-model gateway (MedGemma et al.).
  aiProvider: (process.env.AI_PROVIDER ?? 'ollama') as 'ollama' | 'opencode' | 'dr7',

  ollama: {
    url: process.env.OLLAMA_URL ?? 'http://localhost:11434',
    textModel: process.env.OLLAMA_TEXT_MODEL ?? 'gemma3',
    visionModel: process.env.OLLAMA_VISION_MODEL ?? 'llava',
  },

  opencode: {
    // OpenAI-compatible. The key never reaches the browser — that is the whole point
    // of this server existing.
    baseUrl: process.env.OPENCODE_BASE_URL ?? 'https://opencode.ai/zen/v1',
    apiKey: process.env.OPENCODE_API_KEY ?? '',
    model: process.env.OPENCODE_MODEL ?? '',
  },

  dr7: {
    // Ends at /medical so the shared adapter's `${baseUrl}/chat/completions` lands on
    // dr7's /api/v1/medical/chat/completions.
    baseUrl: process.env.DR7_BASE_URL ?? 'https://dr7.ai/api/v1/medical',
    apiKey: process.env.DR7_API_KEY ?? '',
    model: process.env.DR7_MODEL ?? 'medgemma-4b-it',
    // dr7 silently caps completions at 1000 tokens and still reports finish_reason "stop".
    // A Tetum analysis runs ~950–1000, so without this ~1 in 4 comes back truncated.
    maxTokens: Number(process.env.DR7_MAX_TOKENS ?? 2048),
  },
} as const;

if (env.aiProvider === 'opencode') {
  if (!env.opencode.apiKey) throw new Error('AI_PROVIDER=opencode requires OPENCODE_API_KEY');
  if (!env.opencode.model) throw new Error('AI_PROVIDER=opencode requires OPENCODE_MODEL');
}
if (env.aiProvider === 'dr7' && !env.dr7.apiKey) {
  throw new Error('AI_PROVIDER=dr7 requires DR7_API_KEY');
}

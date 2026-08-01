import { AnalysisResult, PatientData, Language } from "../types";

// Configurable via .env.local (VITE_ prefix required for client exposure), e.g.:
//   VITE_OLLAMA_URL=http://192.168.1.10:11434
//   VITE_OLLAMA_TEXT_MODEL=gemma3
//   VITE_OLLAMA_VISION_MODEL=llava
const OLLAMA_BASE_URL = import.meta.env.VITE_OLLAMA_URL || "http://localhost:11434";
const TEXT_MODEL = import.meta.env.VITE_OLLAMA_TEXT_MODEL || "gemma3";
const VISION_MODEL = import.meta.env.VITE_OLLAMA_VISION_MODEL || "llava";
const OLLAMA_CHAT_URL = `${OLLAMA_BASE_URL}/api/chat`;

// Schema definition for Ollama Structured Output
const analysisSchema = {
  type: "object",
  properties: {
    emergencyAlert: {
      type: "boolean",
      description: "True if the symptoms describe a potentially life-threatening emergency.",
    },
    emergencyMessage: {
      type: "string",
      description: "If emergencyAlert is true, provide a short, urgent warning message. Otherwise null.",
    },
    possibleConditions: {
      type: "array",
      description: "List of exactly 3 possible medical conditions based on symptoms, ranked by likelihood.",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the disease or condition." },
          probability: { type: "string", description: "Likelihood: Must be exactly 'High', 'Moderate', or 'Low'." },
          description: { type: "string", description: "Brief explanation of the condition." },
          reasoning: { type: "string", description: "Why this condition matches the provided symptoms." },
          recommendedAction: { type: "string", description: "What the caregiver or mother should do next." },
          suggestedMedications: {
            type: "array",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                type: { type: "string", description: "One of: 'Over-the-counter', 'Prescription', 'Home Remedy'" },
                description: { type: "string", description: "What this medication does." },
                dosage: { type: "string", description: "General dosage advice or consultation advice." },
              },
            },
          },
        },
      },
    },
    generalAdvice: {
      type: "array",
      items: { type: "string" },
      description: "List of general health tips relevant to the symptoms.",
    },
    recommendedSpecialist: {
      type: "string",
      description: "The SINGLE BEST care provider type for this case. MUST be one of: 'General Practitioner', 'Pediatrician', 'Obstetrician-Gynecologist', or 'Midwife'.",
    },
    disclaimer: {
      type: "string",
      description: "A mandatory medical disclaimer.",
    },
  },
  required: ["emergencyAlert", "possibleConditions", "generalAdvice", "recommendedSpecialist", "disclaimer"],
};

const getLanguageName = (lang: Language) => {
  return {
    'en': 'English',
    'tet': 'Tetum (Timor-Leste)',
    'id': 'Indonesian (Bahasa Indonesia)'
  }[lang];
};

// POST with thinking disabled (reasoning traces make hybrid models far too slow for
// interactive use); models that reject the `think` parameter get a retry without it.
const postChat = async (payload: Record<string, unknown>): Promise<Response> => {
  const send = (body: Record<string, unknown>) => fetch(OLLAMA_CHAT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  let response = await send({ ...payload, think: false });
  if (!response.ok) {
    const errText = await response.text();
    if (/think/i.test(errText)) {
      response = await send(payload);
    } else {
      throw new Error(`Ollama API error: ${response.status} ${errText}`);
    }
  }
  return response;
};

const buildChildPrompt = (p: PatientData, langName: string, symptomDescription: string) => `
  Analyze the following PEDIATRIC case and identify potential medical conditions.

  Child Patient:
  - Age: ${p.ageMonths < 24 ? `${p.ageMonths} months old` : `${p.ageYears} years old`}
  - Sex: ${p.sex}
  ${p.weightKg ? `- Weight: ${p.weightKg} kg` : ''}

  Clinical Presentation:
  - Onset: ${p.symptomOnset}
  - Symptoms: ${symptomDescription}

  Tasks:
  - Identify 3 potential conditions appropriate for this child's age.
  - Screen carefully for IMCI general danger signs (unable to drink or breastfeed, vomits everything,
    convulsions, lethargy or unconsciousness, severe chest indrawing, fast breathing) — if any are
    present or strongly implied, set emergencyAlert to true.
  - Medication suggestions MUST be age-appropriate; when dosing depends on weight or age, say
    "dose must be set by a health worker" instead of giving adult doses.
  - Recommend the best care provider type (recommendedSpecialist).

  IMPORTANT RULES:
  1. RESPONSE MUST BE IN ${langName.toUpperCase()}. All descriptions, reasoning, advice, and names must be in ${langName}.
  2. EXCEPTION: The 'recommendedSpecialist' field MUST be in ENGLISH and one of: 'General Practitioner', 'Pediatrician', 'Obstetrician-Gynecologist', 'Midwife'.
  3. Maintain 'probability' values strictly as 'High', 'Moderate', or 'Low'.
  4. Use JSON format matching the schema.
  5. NEVER include raw image data or base64 strings in the response.
`;

const buildPregnancyPrompt = (p: PatientData, langName: string, symptomDescription: string) => `
  Analyze the following OBSTETRIC case for a pregnant woman and identify potential conditions.

  Patient:
  - Pregnant woman, gestational age: ${p.gestationalWeek} weeks (trimester ${p.gestationalWeek! < 13 ? 1 : p.gestationalWeek! < 28 ? 2 : 3})
  - Age: ${p.ageYears} years

  Clinical Presentation:
  - Onset: ${p.symptomOnset}
  - Symptoms: ${symptomDescription}

  Tasks:
  - Identify 3 potential conditions, interpreting each symptom in the context of the gestational age.
  - Screen carefully for obstetric danger signs (vaginal bleeding, severe headache with blurred vision,
    convulsions, high fever, severe abdominal pain, reduced or absent fetal movement, waters breaking
    before term, severe swelling of face/hands) — if any are present or strongly implied, set
    emergencyAlert to true.
  - Medication suggestions MUST be pregnancy-safe; when safety depends on trimester, say so and
    recommend confirming with a midwife or doctor.
  - Recommend the best care provider type (recommendedSpecialist).

  IMPORTANT RULES:
  1. RESPONSE MUST BE IN ${langName.toUpperCase()}. All descriptions, reasoning, advice, and names must be in ${langName}.
  2. EXCEPTION: The 'recommendedSpecialist' field MUST be in ENGLISH and one of: 'General Practitioner', 'Pediatrician', 'Obstetrician-Gynecologist', 'Midwife'.
  3. Maintain 'probability' values strictly as 'High', 'Moderate', or 'Low'.
  4. Use JSON format matching the schema.
  5. NEVER include raw image data or base64 strings in the response.
`;

export const analyzeSymptoms = async (
  patientData: PatientData,
  language: Language
): Promise<AnalysisResult> => {
  try {
    const { symptoms, image, mode } = patientData;
    const langName = getLanguageName(language);

    let symptomDescription = symptoms;
    if ((!symptoms || symptoms.trim().length === 0) && image) {
      symptomDescription = "Visual symptoms are presented in the attached image. Please analyze the image carefully to identify the condition.";
    }

    let promptText = mode === 'child'
      ? buildChildPrompt(patientData, langName, symptomDescription)
      : buildPregnancyPrompt(patientData, langName, symptomDescription);

    const systemInstruction = `You are an AI maternal and child health assistant for Timor-Leste, supporting mothers and caregivers. Your goal is to help them understand symptoms in children and during pregnancy. Prioritize safety above all: if symptoms suggest an emergency or a danger sign, provide an immediate warning and advise going to the nearest health facility. Provide clear, simple explanations in ${langName}. Follow the JSON schema strictly.`;

    let modelToUse = TEXT_MODEL;
    let cleanBase64 = null;

    if (image) {
      modelToUse = VISION_MODEL; // Switch to vision model if image is provided
      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        cleanBase64 = matches[2];
      } else if (image.includes(',')) {
        cleanBase64 = image.split(',')[1];
      } else {
        cleanBase64 = image;
      }
      promptText += " Also consider visual evidence from the provided image.";
    }

    const payload: any = {
      model: modelToUse,
      messages: [
        { role: "system", content: systemInstruction },
        {
          role: "user",
          content: promptText,
          ...(cleanBase64 ? { images: [cleanBase64] } : {})
        }
      ],
      format: analysisSchema,
      stream: false,
    };

    const response = await postChat(payload);
    const data = await response.json();
    const text = data.message?.content;

    if (text) {
      const jsonStr = text.replace(/```json\n?|```/g, "").trim();
      return JSON.parse(jsonStr) as AnalysisResult;
    } else {
      throw new Error("Empty response from AI (Ollama)");
    }
  } catch (error) {
    console.error("Ollama Analysis Error:", error);
    throw error;
  }
};

export const translateAnalysisResult = async (
  currentResult: AnalysisResult,
  targetLanguage: Language
): Promise<AnalysisResult> => {
  try {
    const langName = getLanguageName(targetLanguage);

    const promptText = `
      You are a professional medical translator.
      Translate the values of the following JSON object into ${langName}.

      Input JSON:
      ${JSON.stringify(currentResult)}

      RULES:
      1. Preserve the EXACT JSON structure.
      2. Do NOT translate the values for 'probability'. They MUST remain 'High', 'Moderate', or 'Low'.
      3. Do NOT translate the value for 'recommendedSpecialist'. It MUST remain in English.
      4. Translate all other string values (names, descriptions, advice, disclaimers) into ${langName}.
      5. Ensure the output is valid JSON matching the original schema.
    `;

    const payload = {
      model: TEXT_MODEL,
      messages: [
        { role: "user", content: promptText }
      ],
      format: analysisSchema,
      stream: false,
    };

    const response = await postChat(payload);
    const data = await response.json();
    const text = data.message?.content;

    if (text) {
      const jsonStr = text.replace(/```json\n?|```/g, "").trim();
      return JSON.parse(jsonStr) as AnalysisResult;
    } else {
      throw new Error("Empty translation response");
    }

  } catch (error) {
    console.error("Ollama Translation Error:", error);
    return currentResult;
  }
};

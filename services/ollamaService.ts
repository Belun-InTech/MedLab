import { AnalysisResult, PatientData, Language } from "../types";

// Note: You can change these models based on what you have pulled in Ollama
// e.g., 'mistral', 'llama3', 'llama3.2', 'gemma2'
const DEFAULT_TEXT_MODEL = "gemma4"; 
// Note: Vision model for image analysis. E.g., 'llava', 'llama3.2-vision'
const DEFAULT_VISION_MODEL = "llava"; 
const OLLAMA_API_URL = "http://localhost:11434/api/chat";

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
          recommendedAction: { type: "string", description: "What the patient should do next." },
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
      description: "The SINGLE BEST medical specialist type for this case. MUST be one of: 'General Practitioner', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician', 'ENT Specialist', 'Internal Medicine', 'Ophthalmologist', 'Orthopedic Surgeon', 'Obstetrician-Gynecologist', 'Dentist', or 'Psychiatrist'.",
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

export const analyzeSymptoms = async (
  patientData: PatientData,
  language: Language
): Promise<AnalysisResult> => {
  try {
    const { age, sex, symptomOnset, symptoms, image } = patientData;
    const langName = getLanguageName(language);

    let symptomDescription = symptoms;
    if ((!symptoms || symptoms.trim().length === 0) && image) {
      symptomDescription = "Visual symptoms are presented in the attached image. Please analyze the image carefully to identify the condition.";
    }

    let promptText = `
      Analyze the following patient case and identify potential medical conditions and medications.
      
      Patient Demographics:
      - Age: ${age}
      - Sex: ${sex}
      
      Clinical Presentation:
      - Onset: ${symptomOnset}
      - Symptoms: ${symptomDescription}
      
      Tasks:
      - Identify 3 potential conditions.
      - Suggest specific medications (OTC/Prescription) or home remedies.
      - Recommend the best specialist type (recommendedSpecialist).
      
      IMPORTANT RULES:
      1. RESPONSE MUST BE IN ${langName.toUpperCase()}. All descriptions, reasoning, advice, and names must be in ${langName}.
      2. EXCEPTION: The 'recommendedSpecialist' field MUST be in ENGLISH (e.g., 'Cardiologist', 'Dermatologist') to match our database.
      3. Maintain 'probability' values strictly as 'High', 'Moderate', or 'Low'.
      4. Use JSON format matching the schema.
      5. NEVER include raw image data or base64 strings in the response.
    `;

    const systemInstruction = `You are an advanced AI medical diagnostic assistant. Your goal is to help patients understand their symptoms. Prioritize patient safety. If symptoms suggest an emergency, provide an immediate warning. Provide clear and easy-to-understand explanations in ${langName}. Follow the JSON schema strictly.`;

    let modelToUse = DEFAULT_TEXT_MODEL;
    let cleanBase64 = null;

    if (image) {
      modelToUse = DEFAULT_VISION_MODEL; // Switch to vision model if image is provided
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

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Ollama API error: ${response.status} ${errText}`);
    }

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
      model: DEFAULT_TEXT_MODEL,
      messages: [
        { role: "user", content: promptText }
      ],
      format: analysisSchema,
      stream: false,
    };

    const response = await fetch(OLLAMA_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Ollama API error: ${response.status} ${errText}`);
    }

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

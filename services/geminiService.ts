
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, PatientData, Language } from "../types";

// Schema definition
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    emergencyAlert: {
      type: Type.BOOLEAN,
      description: "True if the symptoms describe a potentially life-threatening emergency.",
    },
    emergencyMessage: {
      type: Type.STRING,
      description: "If emergencyAlert is true, provide a short, urgent warning message. Otherwise null.",
    },
    possibleConditions: {
      type: Type.ARRAY,
      description: "List of exactly 3 possible medical conditions based on symptoms, ranked by likelihood.",
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the disease or condition." },
          probability: { type: Type.STRING, description: "Likelihood: Must be exactly 'High', 'Moderate', or 'Low'." },
          description: { type: Type.STRING, description: "Brief explanation of the condition." },
          reasoning: { type: Type.STRING, description: "Why this condition matches the provided symptoms." },
          recommendedAction: { type: Type.STRING, description: "What the patient should do next." },
          suggestedMedications: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                type: { type: Type.STRING, description: "One of: 'Over-the-counter', 'Prescription', 'Home Remedy'" },
                description: { type: Type.STRING, description: "What this medication does." },
                dosage: { type: Type.STRING, description: "General dosage advice or consultation advice." },
              },
            },
          },
        },
      },
    },
    generalAdvice: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of general health tips relevant to the symptoms.",
    },
    recommendedSpecialist: {
      type: Type.STRING,
      description: "The SINGLE BEST medical specialist type for this case. MUST be one of: 'General Practitioner', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Pediatrician', 'ENT Specialist', 'Internal Medicine', 'Ophthalmologist', 'Orthopedic Surgeon', 'Obstetrician-Gynecologist', 'Dentist', or 'Psychiatrist'.",
    },
    disclaimer: {
      type: Type.STRING,
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
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const { age, sex, symptomOnset, symptoms, image } = patientData;
    const langName = getLanguageName(language);

    let symptomDescription = symptoms;
    if ((!symptoms || symptoms.trim().length === 0) && image) {
      symptomDescription = "Visual symptoms are presented in the attached image. Please analyze the image carefully to identify the condition.";
    }

    const promptText = `
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

    const parts: any[] = [{ text: promptText }];

    if (image) {
      let mimeType = "image/jpeg";
      let cleanBase64 = image;

      const matches = image.match(/^data:([^;]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        mimeType = matches[1];
        cleanBase64 = matches[2];
      } else if (image.includes(',')) {
         const split = image.split(',');
         cleanBase64 = split[1];
         const mimeMatch = split[0].match(/:(.*?);/);
         if (mimeMatch) {
            mimeType = mimeMatch[1];
         }
      }

      parts.push({
        inlineData: {
          mimeType: mimeType,
          data: cleanBase64,
        },
      });
      parts[0].text += " Also consider visual evidence from the provided image.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: parts,
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: `You are an advanced AI medical diagnostic assistant. Your goal is to help patients understand their symptoms. Prioritize patient safety. If symptoms suggest an emergency, provide an immediate warning. Provide clear and easy-to-understand explanations in ${langName}. Follow the JSON schema strictly. Do not repeat input data or base64 strings in your response.`,
      },
    });

    const text = response.text;
    if (text) {
      const jsonStr = text.replace(/```json\n?|```/g, "").trim();
      return JSON.parse(jsonStr) as AnalysisResult;
    } else {
      throw new Error("Empty response from AI");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const translateAnalysisResult = async (
  currentResult: AnalysisResult,
  targetLanguage: Language
): Promise<AnalysisResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: promptText,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
      },
    });

    const text = response.text;
    if (text) {
      const jsonStr = text.replace(/```json\n?|```/g, "").trim();
      return JSON.parse(jsonStr) as AnalysisResult;
    } else {
      throw new Error("Empty translation response");
    }

  } catch (error) {
    console.error("Translation Error:", error);
    return currentResult;
  }
};

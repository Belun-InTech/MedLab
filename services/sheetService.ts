import { PatientData, AnalysisResult } from "../types";

// NOTE: To make this work with a real Google Sheet:
// 1. Create a Google Sheet.
// 2. Go to Extensions > Apps Script.
// 3. Paste a script to handle doPost(e) and append row.
// 4. Deploy as Web App (Execute as: Me, Who has access: Anyone).
// 5. Paste the Web App URL below inside the quotes.

// PASTE YOUR GOOGLE SCRIPT WEB APP URL HERE 👇
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxaofoUsjjxqYQyOOzLKqRZP7KQaxy9duEn9jLbV_9sqKmMiCJHvapz2QP4VWTUUDWI/exec"; 

export const recordPatientData = async (
  data: PatientData, 
  analysisResult?: AnalysisResult
): Promise<boolean> => {
  console.log("Recording patient visit:", { data, analysisResult });

  // Check if the URL is still the placeholder or empty
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("YOUR_GENERATED")) {
    console.warn("Google Script URL not configured. Simulating save.");
    // Simulate network delay to show the UI state
    await new Promise(resolve => setTimeout(resolve, 800));
    return true; 
  }

  try {
    // Prepare a flattened payload for the spreadsheet
    const payload = {
      timestamp: new Date().toLocaleString(), // Readable "Date patients meet doctor"
      name: data.name,
      dob: data.dob,
      age: data.age,
      sex: data.sex,
      address: data.address,
      symptomOnset: data.symptomOnset,
      symptoms: data.symptoms,
      // Add AI Analysis Results
      diagnosis: analysisResult?.possibleConditions?.[0]?.name || "Not Analyzed",
      probability: analysisResult?.possibleConditions?.[0]?.probability || "-",
      specialist: analysisResult?.recommendedSpecialist || "-"
    };

    // We use no-cors mode because Google Apps Script doesn't support CORS preflight easily
    await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.error("Failed to save to Google Sheet:", error);
    return false;
  }
};
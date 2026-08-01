// Thin client for the analysis API. The prompt, the JSON schema and the AI provider
// credentials all live on the server now — none of it ships in the browser bundle.

import { AnalysisResult, AnalyzeRequest, ConsultationSummary, Language } from '../shared/types';
import { api } from './api';

export const analyzeSymptoms = async (request: AnalyzeRequest): Promise<AnalysisResult> => {
  const { result } = await api.post<{ id: string; result: AnalysisResult }>(
    '/consultations/analyze',
    request,
  );
  return result;
};

/** Re-translate an existing result when the UI language changes. */
export const translateAnalysisResult = async (
  result: AnalysisResult,
  language: Language,
): Promise<AnalysisResult> => {
  const response = await api.post<{ result: AnalysisResult }>('/consultations/translate', {
    result,
    language,
  });
  return response.result;
};

/** Child health timeline — all consultations, or just one child's. */
export const fetchConsultations = async (childId?: string): Promise<ConsultationSummary[]> => {
  const { consultations } = await api.get<{ consultations: ConsultationSummary[] }>(
    `/consultations${childId ? `?childId=${encodeURIComponent(childId)}` : ''}`,
  );
  return consultations;
};

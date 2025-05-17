import { apiRequest } from './queryClient';
import { InsertReport } from '@shared/schema';

export async function generateReport(formData: InsertReport) {
  const response = await apiRequest('POST', '/api/report/generate', formData);
  return response.json();
}

export async function translateReport(reportText: string, targetLanguage: string) {
  const response = await apiRequest(
    'POST',
    '/api/report/translate',
    { reportText, targetLanguage }
  );
  return response.json();
}

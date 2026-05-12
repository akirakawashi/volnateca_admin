import { apiFetch } from './client';
import type { CreateQuizPayload, CreatedQuiz } from '../types/quiz';

export function createQuiz(payload: CreateQuizPayload): Promise<CreatedQuiz> {
  return apiFetch<CreatedQuiz>('/v1/admin/quiz', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

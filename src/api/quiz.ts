import { apiFetch } from './client';
import type {
  AdminQuiz,
  CreateQuizPayload,
  CreatedQuiz,
  UpdateQuizQuestionImagePayload,
} from '../types/quiz';

export function listQuizzes(): Promise<AdminQuiz[]> {
  return apiFetch<AdminQuiz[]>('/v1/admin/quiz');
}

export function createQuiz(payload: CreateQuizPayload): Promise<CreatedQuiz> {
  return apiFetch<CreatedQuiz>('/v1/admin/quiz', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateQuizQuestionImage(
  quizQuestionsId: number,
  payload: UpdateQuizQuestionImagePayload,
): Promise<AdminQuiz> {
  return apiFetch<AdminQuiz>(`/v1/admin/quiz/questions/${quizQuestionsId}/image`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

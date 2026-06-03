import { createQuiz } from '../api/quiz';
import type { CreateQuizPayload, CreatedQuiz } from '../types/quiz';
import { useAsyncAction } from './useAsyncAction';

interface UseCreateQuizResult {
  create: (payload: CreateQuizPayload) => Promise<CreatedQuiz | null>;
  loading: boolean;
  error: string | null;
  result: CreatedQuiz | null;
  reset: () => void;
}

export function useCreateQuiz(): UseCreateQuizResult {
  const { run: create, loading, error, result, reset } = useAsyncAction(createQuiz);

  return { create, loading, error, result, reset };
}

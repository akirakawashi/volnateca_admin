import { useState } from 'react';
import { createQuiz } from '../api/quiz';
import type { CreateQuizPayload, CreatedQuiz } from '../types/quiz';

interface UseCreateQuizResult {
  create: (payload: CreateQuizPayload) => Promise<CreatedQuiz | null>;
  loading: boolean;
  error: string | null;
  result: CreatedQuiz | null;
  reset: () => void;
}

export function useCreateQuiz(): UseCreateQuizResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedQuiz | null>(null);

  const create = async (payload: CreateQuizPayload): Promise<CreatedQuiz | null> => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const created = await createQuiz(payload);
      setResult(created);
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setResult(null);
  };

  return { create, loading, error, result, reset };
}

import { useCallback, useState } from 'react';
import { createQuiz, listQuizzes, updateQuizQuestionImage } from '../api/quiz';
import type {
  AdminQuiz,
  CreateQuizPayload,
  CreatedQuiz,
  UpdateQuizQuestionImagePayload,
} from '../types/quiz';

function sortQuizzes(quizzes: AdminQuiz[]): AdminQuiz[] {
  return [...quizzes].sort((left, right) => {
    if (left.can_edit !== right.can_edit) {
      return left.can_edit ? -1 : 1;
    }
    if (left.starts_at !== right.starts_at) {
      if (left.starts_at === null) return 1;
      if (right.starts_at === null) return -1;
      return left.starts_at.localeCompare(right.starts_at);
    }
    return left.tasks_id - right.tasks_id;
  });
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

interface UseCreateQuizResult {
  quizzes: AdminQuiz[] | null;
  create: (payload: CreateQuizPayload) => Promise<CreatedQuiz | null>;
  updateQuestionImage: (
    quizQuestionsId: number,
    payload: UpdateQuizQuestionImagePayload,
  ) => Promise<AdminQuiz | null>;
  fetch: () => Promise<void>;
  quizzesLoading: boolean;
  loading: boolean;
  creating: boolean;
  updating: boolean;
  error: string | null;
  successMessage: string | null;
  result: CreatedQuiz | null;
  reset: () => void;
  resetStatus: () => void;
}

export function useCreateQuiz(): UseCreateQuizResult {
  const [quizzes, setQuizzes] = useState<AdminQuiz[] | null>(null);
  const [quizzesLoading, setQuizzesLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [result, setResult] = useState<CreatedQuiz | null>(null);

  const fetch = useCallback(async () => {
    setQuizzesLoading(true);
    setError(null);
    try {
      const data = await listQuizzes();
      setQuizzes(sortQuizzes(data));
    } catch (e) {
      setError(getErrorMessage(e));
    } finally {
      setQuizzesLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreateQuizPayload) => {
    setCreating(true);
    setError(null);
    setSuccessMessage(null);
    setResult(null);
    try {
      const created = await createQuiz(payload);
      setResult(created);

      const data = await listQuizzes().catch(() => null);
      if (data !== null) {
        setQuizzes(sortQuizzes(data));
      }

      return created;
    } catch (e) {
      setError(getErrorMessage(e));
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  const updateQuestionImage = useCallback(
    async (quizQuestionsId: number, payload: UpdateQuizQuestionImagePayload) => {
      setUpdating(true);
      setError(null);
      setSuccessMessage(null);
      setResult(null);
      try {
        const updated = await updateQuizQuestionImage(quizQuestionsId, payload);
        setQuizzes((prev) =>
          sortQuizzes(
            prev
              ? prev.map((item) => (item.tasks_id === updated.tasks_id ? updated : item))
              : [updated],
          ),
        );
        setSuccessMessage(`Фото вопроса в квизе ${updated.task_name} обновлено`);
        return updated;
      } catch (e) {
        setError(getErrorMessage(e));
        const data = await listQuizzes().catch(() => null);
        if (data !== null) {
          setQuizzes(sortQuizzes(data));
        }
        return null;
      } finally {
        setUpdating(false);
      }
    },
    [],
  );

  const resetStatus = useCallback(() => {
    setError(null);
    setSuccessMessage(null);
    setResult(null);
  }, []);

  const reset = resetStatus;

  return {
    quizzes,
    create,
    updateQuestionImage,
    fetch,
    quizzesLoading,
    loading: creating,
    creating,
    updating,
    error,
    successMessage,
    result,
    reset,
    resetStatus,
  };
}

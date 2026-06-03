import { useCallback, useState } from 'react';

type AsyncAction<TArgs extends unknown[], TResult> = (...args: TArgs) => Promise<TResult>;

interface UseAsyncActionOptions {
  rethrow?: boolean;
  unknownErrorMessage?: string;
}

interface UseAsyncActionBase<TResult> {
  loading: boolean;
  error: string | null;
  result: TResult | null;
  reset: () => void;
}

export interface UseAsyncActionResult<TArgs extends unknown[], TResult>
  extends UseAsyncActionBase<TResult> {
  run: (...args: TArgs) => Promise<TResult | null>;
}

export interface UseAsyncActionRethrowResult<TArgs extends unknown[], TResult>
  extends UseAsyncActionBase<TResult> {
  run: (...args: TArgs) => Promise<TResult>;
}

function getErrorMessage(error: unknown, unknownErrorMessage?: string): string {
  if (error instanceof Error) return error.message;
  return unknownErrorMessage ?? String(error);
}

export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: AsyncAction<TArgs, TResult>,
  options: UseAsyncActionOptions & { rethrow: true },
): UseAsyncActionRethrowResult<TArgs, TResult>;

export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: AsyncAction<TArgs, TResult>,
  options?: UseAsyncActionOptions,
): UseAsyncActionResult<TArgs, TResult>;

export function useAsyncAction<TArgs extends unknown[], TResult>(
  action: AsyncAction<TArgs, TResult>,
  options: UseAsyncActionOptions = {},
): UseAsyncActionResult<TArgs, TResult> | UseAsyncActionRethrowResult<TArgs, TResult> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TResult | null>(null);
  const { rethrow = false, unknownErrorMessage } = options;

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const actionResult = await action(...args);
        setResult(actionResult);
        return actionResult;
      } catch (e) {
        setError(getErrorMessage(e, unknownErrorMessage));
        if (rethrow) throw e;
        return null;
      } finally {
        setLoading(false);
      }
    },
    [action, rethrow, unknownErrorMessage],
  );

  const reset = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return { run, loading, error, result, reset };
}

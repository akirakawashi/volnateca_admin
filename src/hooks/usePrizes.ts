import { useCallback, useState } from 'react';
import { createPrize, listPrizes } from '../api/prizes';
import type { AdminPrize, CreatePrizePayload } from '../types/prize';

function sortPrizes(prizes: AdminPrize[]): AdminPrize[] {
  return [...prizes].sort((left, right) => {
    if (left.sort_order !== right.sort_order) {
      return left.sort_order - right.sort_order;
    }
    if (left.cost_points !== right.cost_points) {
      return left.cost_points - right.cost_points;
    }
    return left.prizes_id - right.prizes_id;
  });
}

export function usePrizes() {
  const [prizes, setPrizes] = useState<AdminPrize[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AdminPrize | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPrizes();
      setPrizes(sortPrizes(data));
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: CreatePrizePayload): Promise<AdminPrize | null> => {
    setCreating(true);
    setError(null);
    setResult(null);
    try {
      const created = await createPrize(payload);
      setResult(created);
      setPrizes((prev) => sortPrizes(prev ? [created, ...prev.filter((item) => item.prizes_id !== created.prizes_id)] : [created]));
      return created;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return null;
    } finally {
      setCreating(false);
    }
  }, []);

  const resetStatus = useCallback(() => {
    setError(null);
    setResult(null);
  }, []);

  return {
    prizes,
    loading,
    creating,
    error,
    result,
    fetch,
    create,
    resetStatus,
  };
}

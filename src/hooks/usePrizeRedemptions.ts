import { useCallback, useState } from 'react';
import {
  cancelPrizeRedemption,
  fulfillPrizeRedemption,
  listPrizeRedemptions,
} from '../api/prizeRedemptions';
import type {
  AdminPrizeRedemption,
  PrizeRedemptionStatus,
} from '../types/prizeRedemption';

export interface PrizeRedemptionListFilters {
  status: PrizeRedemptionStatus | null;
  prizes_id: number | null;
}

export function usePrizeRedemptions() {
  const [items, setItems] = useState<AdminPrizeRedemption[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const fetchList = useCallback(async (filters: PrizeRedemptionListFilters) => {
    setLoading(true);
    setError(null);
    setLastAction(null);

    try {
      const page = await listPrizeRedemptions({
        status: filters.status ?? undefined,
        prizes_id: filters.prizes_id ?? undefined,
        page: 1,
      });
      setItems(page.items);
      setPage(1);
      setHasMore(page.has_more);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setItems([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadMore = useCallback(
    async (filters: PrizeRedemptionListFilters) => {
      if (!hasMore || loadingMore) {
        return;
      }

      const nextPage = page + 1;
      setLoadingMore(true);
      setError(null);

      try {
        const pageData = await listPrizeRedemptions({
          status: filters.status ?? undefined,
          prizes_id: filters.prizes_id ?? undefined,
          page: nextPage,
        });
        setItems((prev) => {
          const known = new Set(prev.map((item) => item.prize_redemptions_id));
          const merged = [...prev];
          for (const item of pageData.items) {
            if (!known.has(item.prize_redemptions_id)) {
              merged.push(item);
            }
          }
          return merged;
        });
        setPage(nextPage);
        setHasMore(pageData.has_more);
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoadingMore(false);
      }
    },
    [hasMore, loadingMore, page],
  );

  const fulfill = useCallback(
    async (
      prizeRedemptionsId: number,
      comment: string | null,
    ): Promise<AdminPrizeRedemption | null> => {
      setActing(true);
      setError(null);
      setLastAction(null);

      try {
        const updated = await fulfillPrizeRedemption(prizeRedemptionsId, {
          comment: comment?.trim() || null,
        });
        setItems((prev) =>
          prev.map((item) =>
            item.prize_redemptions_id === updated.prize_redemptions_id ? updated : item,
          ),
        );
        setLastAction(`Заявка #${updated.prize_redemptions_id} отмечена как выданная`);
        return updated;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return null;
      } finally {
        setActing(false);
      }
    },
    [],
  );

  const cancel = useCallback(
    async (
      prizeRedemptionsId: number,
      cancelReason: string,
    ): Promise<AdminPrizeRedemption | null> => {
      setActing(true);
      setError(null);
      setLastAction(null);

      try {
        const updated = await cancelPrizeRedemption(prizeRedemptionsId, {
          cancel_reason: cancelReason.trim(),
        });
        setItems((prev) =>
          prev.map((item) =>
            item.prize_redemptions_id === updated.prize_redemptions_id ? updated : item,
          ),
        );
        setLastAction(
          `Заявка #${updated.prize_redemptions_id} отменена, ${updated.points_spent} ✦ возвращены`,
        );
        return updated;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return null;
      } finally {
        setActing(false);
      }
    },
    [],
  );

  const resetStatus = useCallback(() => {
    setError(null);
    setLastAction(null);
  }, []);

  return {
    items,
    hasMore,
    loading,
    loadingMore,
    acting,
    error,
    lastAction,
    fetchList,
    loadMore,
    fulfill,
    cancel,
    resetStatus,
  };
}

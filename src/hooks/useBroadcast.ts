import { useCallback, useEffect, useRef, useState } from 'react';
import { getBroadcastStatus, startBroadcast } from '../api/broadcast';
import type { BroadcastSnapshot } from '../types/broadcast';

const POLL_INTERVAL_MS = 2000;
const ACTIVE_STATUSES = new Set<BroadcastSnapshot['status']>(['queued', 'running']);

interface UseBroadcastResult {
  start: (message: string) => Promise<BroadcastSnapshot | null>;
  loading: boolean;
  error: string | null;
  snapshot: BroadcastSnapshot | null;
  reset: () => void;
}

export function useBroadcast(): UseBroadcastResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<BroadcastSnapshot | null>(null);
  const pollTimerRef = useRef<number | null>(null);

  const clearPollTimer = useCallback(() => {
    if (pollTimerRef.current != null) {
      window.clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const refreshStatus = useCallback(async (broadcastId: string) => {
    try {
      const next = await getBroadcastStatus(broadcastId);
      setSnapshot(next);
      return next;
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Неизвестная ошибка';
      setError(message);
      clearPollTimer();
      return null;
    }
  }, [clearPollTimer]);

  useEffect(() => {
    if (!snapshot || !ACTIVE_STATUSES.has(snapshot.status)) {
      clearPollTimer();
      return;
    }

    clearPollTimer();
    pollTimerRef.current = window.setInterval(() => {
      void refreshStatus(snapshot.broadcast_id);
    }, POLL_INTERVAL_MS);

    return clearPollTimer;
  }, [snapshot, refreshStatus, clearPollTimer]);

  useEffect(() => () => clearPollTimer(), [clearPollTimer]);

  const start = async (message: string): Promise<BroadcastSnapshot | null> => {
    setLoading(true);
    setError(null);
    setSnapshot(null);
    clearPollTimer();
    try {
      const created = await startBroadcast({ message });
      setSnapshot(created);
      return created;
    } catch (e) {
      const messageText = e instanceof Error ? e.message : 'Неизвестная ошибка';
      setError(messageText);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    clearPollTimer();
    setError(null);
    setSnapshot(null);
  };

  return { start, loading, error, snapshot, reset };
}

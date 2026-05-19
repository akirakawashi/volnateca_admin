import { useEffect } from 'react';
import type { RefObject } from 'react';

interface UseAutoStatusMessageOptions {
  active: boolean;
  scrollRef?: RefObject<HTMLElement | null>;
  onDismiss?: () => void;
  dismissAfter?: number;
}

export function useAutoStatusMessage({
  active,
  scrollRef,
  onDismiss,
  dismissAfter = 6000,
}: UseAutoStatusMessageOptions) {
  useEffect(() => {
    if (!active || !scrollRef?.current) return;

    const frame = window.requestAnimationFrame(() => {
      scrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [active, scrollRef]);

  useEffect(() => {
    if (!active || !onDismiss || dismissAfter <= 0) return;

    const timer = window.setTimeout(onDismiss, dismissAfter);
    return () => window.clearTimeout(timer);
  }, [active, dismissAfter, onDismiss]);
}

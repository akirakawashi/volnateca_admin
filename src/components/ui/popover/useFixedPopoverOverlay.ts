import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  getFixedPopoverStyleFromRoot,
  isFixedPopoverReady,
  type FixedPopoverOptions,
} from './fixedPopoverStyle';

type UseFixedPopoverOverlayParams = FixedPopoverOptions & {
  onBlur?: () => void;
};

export function useFixedPopoverOverlay({
  onBlur,
  gap,
  minWidth,
  estimatedHeight,
}: UseFixedPopoverOverlayParams = {}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState<CSSProperties | null>(null);

  const updatePosition = useCallback(() => {
    setStyle(getFixedPopoverStyleFromRoot(rootRef.current, { gap, minWidth, estimatedHeight }));
  }, [estimatedHeight, gap, minWidth]);

  const prepareOpenPosition = useCallback(() => {
    setStyle(getFixedPopoverStyleFromRoot(rootRef.current, { gap, minWidth, estimatedHeight }));
  }, [estimatedHeight, gap, minWidth]);

  useLayoutEffect(() => {
    if (!open) {
      setStyle(null);
      return undefined;
    }

    updatePosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideTrigger = rootRef.current?.contains(target) ?? false;
      const insideOverlay = overlayRef.current?.contains(target) ?? false;

      if (!insideTrigger && !insideOverlay) {
        setOpen(false);
        onBlur?.();
      }
    };

    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        onBlur?.();
      }
    };

    window.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('keydown', handleEscape);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('keydown', handleEscape);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [onBlur, open, updatePosition]);

  const toggleOpen = useCallback(
    (beforeOpen?: () => void) => {
      setOpen((current) => {
        if (!current) {
          beforeOpen?.();
          prepareOpenPosition();
          return true;
        }
        return false;
      });
    },
    [prepareOpenPosition],
  );

  const openOverlay = useCallback(
    (beforeOpen?: () => void) => {
      beforeOpen?.();
      prepareOpenPosition();
      setOpen(true);
    },
    [prepareOpenPosition],
  );

  const closeOverlay = useCallback(() => {
    setOpen(false);
  }, []);

  return {
    rootRef,
    overlayRef,
    open,
    setOpen,
    style,
    overlayReady: open && isFixedPopoverReady(style),
    toggleOpen,
    openOverlay,
    closeOverlay,
  };
}

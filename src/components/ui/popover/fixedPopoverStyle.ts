import type { CSSProperties } from 'react';

export type FixedPopoverOptions = {
  gap?: number;
  minWidth?: number;
  estimatedHeight?: number;
};

const HIDDEN_STYLE: CSSProperties = {
  position: 'fixed',
  top: -9999,
  left: -9999,
  visibility: 'hidden',
  pointerEvents: 'none',
};

export function getFixedPopoverStyleFromTrigger(
  trigger: Element | null | undefined,
  options: FixedPopoverOptions = {},
): CSSProperties {
  const gap = options.gap ?? 10;
  const minWidth = options.minWidth ?? 0;
  const estimatedHeight = options.estimatedHeight ?? 280;

  if (!(trigger instanceof HTMLElement)) {
    return {
      ...HIDDEN_STYLE,
      width: minWidth || undefined,
    };
  }

  const rect = trigger.getBoundingClientRect();
  const width = Math.max(rect.width, minWidth);
  let top = rect.bottom + gap;
  let left = rect.left;

  if (top + estimatedHeight > window.innerHeight - 8) {
    top = Math.max(8, rect.top - gap - estimatedHeight);
  }

  if (left + width > window.innerWidth - 8) {
    left = Math.max(8, window.innerWidth - width - 8);
  }

  return {
    position: 'fixed',
    top,
    left,
    width,
  };
}

export function getFixedPopoverStyleFromRoot(
  root: HTMLDivElement | null,
  options?: FixedPopoverOptions,
): CSSProperties {
  const trigger = root?.querySelector('button');
  return getFixedPopoverStyleFromTrigger(trigger, options);
}

export function isFixedPopoverReady(style: CSSProperties | null | undefined): boolean {
  return (
    style != null
    && style.position === 'fixed'
    && style.visibility !== 'hidden'
    && typeof style.top === 'number'
  );
}

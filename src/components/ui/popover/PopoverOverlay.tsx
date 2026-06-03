import { createPortal } from 'react-dom';
import type { CSSProperties, ReactNode, Ref } from 'react';
import styles from './popoverOverlay.module.css';

type PopoverOverlayProps = {
  show: boolean;
  overlayRef: Ref<HTMLDivElement>;
  style?: CSSProperties | null;
  id?: string;
  role?: string;
  'aria-modal'?: boolean | 'false' | 'true';
  panelClassName?: string;
  children: ReactNode;
};

export function PopoverOverlay({
  show,
  overlayRef,
  style,
  id,
  role,
  'aria-modal': ariaModal,
  panelClassName,
  children,
}: PopoverOverlayProps) {
  if (!show || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div ref={overlayRef} className={styles.shell} style={style ?? undefined}>
      <div className={[styles.clip, styles.clipEnter].join(' ')}>
        <div className={styles.glass} aria-hidden="true" />
        <div
          id={id}
          role={role}
          aria-modal={ariaModal}
          className={[styles.panel, panelClassName].filter(Boolean).join(' ')}
        >
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}

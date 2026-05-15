import type { ReactNode } from 'react';
import styles from './Alert.module.css';

type AlertVariant = 'success' | 'error' | 'info';

interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;
}

function IconCheck() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconX() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="8.5" />
      <line x1="12" y1="12" x2="12" y2="16" />
    </svg>
  );
}

const iconMap: Record<AlertVariant, ReactNode> = {
  success: <IconCheck />,
  error: <IconX />,
  info: <IconInfo />,
};

export function Alert({ variant, children }: AlertProps) {
  return (
    <div
      className={[styles.alert, styles[variant]].join(' ')}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <span className={styles.iconBubble} aria-hidden="true">
        {iconMap[variant]}
      </span>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

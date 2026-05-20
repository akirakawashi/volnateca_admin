import type { ReactNode } from 'react';
import styles from './Alert.module.css';

type AlertVariant = 'success' | 'error' | 'info';

interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;
}

const badgeMap: Record<AlertVariant, string> = {
  success: 'OK',
  error: 'ER',
  info: 'IN',
};

export function Alert({ variant, children }: AlertProps) {
  return (
    <div
      className={[styles.alert, styles[variant]].join(' ')}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      <span className={styles.iconBubble} aria-hidden="true">
        {badgeMap[variant]}
      </span>
      <div className={styles.body}>{children}</div>
    </div>
  );
}

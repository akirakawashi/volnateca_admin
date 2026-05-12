import type { ReactNode } from 'react';
import styles from './Alert.module.css';

type AlertVariant = 'success' | 'error' | 'info';

interface AlertProps {
  variant: AlertVariant;
  children: ReactNode;
}

const icons: Record<AlertVariant, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
};

export function Alert({ variant, children }: AlertProps) {
  return (
    <div className={[styles.alert, styles[variant]].join(' ')}>
      <span className={styles.icon}>{icons[variant]}</span>
      <span className={styles.content}>{children}</span>
    </div>
  );
}

import type { ButtonHTMLAttributes } from 'react';
import styles from './Button.module.css';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const cls = [styles.btn, styles[variant], styles[size], loading ? styles.isLoading : '', className]
    .filter(Boolean).join(' ');
  return (
    <button {...rest} className={cls} disabled={disabled || loading} aria-busy={loading}>
      {loading && (
        <span className={styles.spinnerWrap} aria-hidden="true">
          <span className={styles.spinner} />
        </span>
      )}
      <span className={loading ? styles.labelHidden : undefined}>{children}</span>
    </button>
  );
}

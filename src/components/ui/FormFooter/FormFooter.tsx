import type { ReactNode } from 'react';
import styles from './FormFooter.module.css';

interface FormFooterProps {
  children: ReactNode;
  className?: string;
  /** Внутри Card — без лишнего отступа сверху */
  inCard?: boolean;
}

export function FormFooter({ children, className, inCard }: FormFooterProps) {
  return (
    <div
      className={[styles.footer, inCard ? styles.inCard : '', className].filter(Boolean).join(' ')}
    >
      {children}
    </div>
  );
}

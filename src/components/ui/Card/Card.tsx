import type { ReactNode } from 'react';
import styles from './Card.module.css';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  action?: ReactNode;
}

export function Card({ children, className, title, action }: CardProps) {
  return (
    <section className={[styles.card, className].filter(Boolean).join(' ')}>
      {(title || action) && (
        <header className={styles.cardHead}>
          {title && <h3 className={styles.cardTitle}>{title}</h3>}
          {action && <div className={styles.cardActions}>{action}</div>}
        </header>
      )}
      <div className={styles.cardBody}>
        {children}
      </div>
    </section>
  );
}

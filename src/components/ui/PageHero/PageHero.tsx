import type { ReactNode } from 'react';
import styles from './PageHero.module.css';

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  subtitle: ReactNode;
  /** Компактные метрики или действия справа от заголовка */
  aside?: ReactNode;
  asideClassName?: string;
  className?: string;
}

export function PageHero({
  eyebrow,
  title,
  subtitle,
  aside,
  asideClassName,
  className,
}: PageHeroProps) {
  return (
    <header className={[styles.hero, className].filter(Boolean).join(' ')}>
      <div className={styles.leading}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {aside ? (
            <div className={[styles.meta, asideClassName].filter(Boolean).join(' ')}>
              {aside}
            </div>
          ) : null}
        </div>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
    </header>
  );
}

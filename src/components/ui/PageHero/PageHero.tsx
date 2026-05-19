import type { ReactNode } from 'react';
import styles from './PageHero.module.css';

interface PageHeroProps {
  eyebrow: string;
  title: ReactNode;
  subtitle: ReactNode;
  aside?: ReactNode;
  asideClassName?: string;
  className?: string;
}

interface PageHeroMarkProps {
  label: string;
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
      <div className={styles.content}>
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.subtitle}>{subtitle}</p>
      </div>
      {aside ? (
        <div className={[styles.aside, asideClassName].filter(Boolean).join(' ')}>
          {aside}
        </div>
      ) : null}
    </header>
  );
}

export function PageHeroMark({ label }: PageHeroMarkProps) {
  return (
    <div className={styles.mark} aria-hidden="true">
      <span className={styles.markInner} />
      <strong className={styles.markLabel}>{label}</strong>
    </div>
  );
}

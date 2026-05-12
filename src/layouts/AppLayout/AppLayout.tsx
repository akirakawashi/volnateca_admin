import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.shell}>
      <Sidebar />
      <div className={styles.main}>
        <main className={styles.content}>
          <div className={styles.inner}>{children}</div>
        </main>
      </div>
    </div>
  );
}

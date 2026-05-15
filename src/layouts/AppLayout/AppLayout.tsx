import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.workspace}>
      <Sidebar />
      <div className={styles.pane}>
        <div className={styles.scrollRegion}>
          <div className={styles.container}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

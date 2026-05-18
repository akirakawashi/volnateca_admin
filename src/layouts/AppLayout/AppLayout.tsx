import type { ReactNode } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

export function AppLayout({ children, onLogout }: AppLayoutProps) {
  return (
    <div className={styles.workspace}>
      <Sidebar onLogout={onLogout} />
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

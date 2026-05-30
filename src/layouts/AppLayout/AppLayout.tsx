import type { ReactNode } from 'react';
import { RedemptionQueueProvider } from '../../contexts/RedemptionQueueContext';
import { Sidebar } from '../Sidebar/Sidebar';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

export function AppLayout({ children, onLogout }: AppLayoutProps) {
  return (
    <RedemptionQueueProvider>
      <div className={styles.workspace}>
        <div className={styles.backdrop} aria-hidden="true" />
        <Sidebar onLogout={onLogout} />
        <div className={styles.pane}>
          <div className={styles.scrollRegion}>
            <div className={styles.container}>{children}</div>
          </div>
        </div>
      </div>
    </RedemptionQueueProvider>
  );
}

import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

function SvgHome() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21V12h6v9"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SvgQuizDoc() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="2" width="16" height="20" rx="2.5"
        stroke="currentColor" strokeWidth="1.7"/>
      <path d="M8 7h8M8 12h8M8 17h5"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}

function SvgPost() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SvgTemplate() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2.5" stroke="currentColor" strokeWidth="1.7"/>
      <path d="M7 8h10M7 12h7M7 16h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}

function SvgLogout() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Главная', icon: <SvgHome /> },
  { to: '/quiz/create', label: 'Создать квиз', icon: <SvgQuizDoc /> },
  { to: '/wall/post', label: 'Создать пост', icon: <SvgPost /> },
  { to: '/message-templates', label: 'Шаблоны', icon: <SvgTemplate /> },
];

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <figure className={styles.appIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white"
            strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M2 12c1.5-3 3-4.5 4.5-4.5S9 9 10.5 12s3 4.5 4.5 4.5S18 15 19.5 12s3-4.5 4.5-4.5" />
          </svg>
        </figure>
        <div className={styles.brandMeta}>
          <span className={styles.brandName}>Волнатека</span>
          <span className={styles.brandRole}>Control room</span>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Основное меню">
        <p className={styles.sectionLabel}>Навигация</p>
        <ul className={styles.navList} role="list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.active : ''].filter(Boolean).join(' ')
                }
              >
                <span className={styles.navIcon} aria-hidden="true">{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className={styles.foot}>
        <div className={styles.sessionCard} aria-hidden="true">
          <span className={styles.sessionDot} />
          <div>
            <span className={styles.sessionLabel}>Сессия</span>
            <strong className={styles.sessionValue}>Активна</strong>
          </div>
        </div>
        <button
          type="button"
          className={[styles.footBtn, styles.logoutBtn].join(' ')}
          onClick={onLogout}
          aria-label="Выйти из админ-панели"
        >
          <span className={styles.footIcon} aria-hidden="true">
            <SvgLogout />
          </span>
          <span className={styles.themeLabel}>Выйти</span>
        </button>
      </div>
    </aside>
  );
}

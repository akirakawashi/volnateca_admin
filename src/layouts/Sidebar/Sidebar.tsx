import { NavLink } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';
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

function SvgMoon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/>
    </svg>
  );
}

function SvgSun() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5"/>
      <line x1="12" y1="1.5" x2="12" y2="4.5"/>
      <line x1="12" y1="19.5" x2="12" y2="22.5"/>
      <line x1="4.1" y1="4.1" x2="6.2" y2="6.2"/>
      <line x1="17.8" y1="17.8" x2="19.9" y2="19.9"/>
      <line x1="1.5" y1="12" x2="4.5" y2="12"/>
      <line x1="19.5" y1="12" x2="22.5" y2="12"/>
      <line x1="4.1" y1="19.9" x2="6.2" y2="17.8"/>
      <line x1="17.8" y1="6.2" x2="19.9" y2="4.1"/>
    </svg>
  );
}

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Главная', icon: <SvgHome /> },
  { to: '/quiz/create', label: 'Создать квиз', icon: <SvgQuizDoc /> },
  { to: '/wall/post', label: 'Создать пост', icon: <SvgPost /> },
];

export function Sidebar() {
  const { theme, toggle } = useTheme();

  return (
    <aside className={styles.sidebar}>
      {/* ── Brand ─────────────────────────────────────────── */}
      <div className={styles.brand}>
        <figure className={styles.appIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white"
            strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M2 12c1.5-3 3-4.5 4.5-4.5S9 9 10.5 12s3 4.5 4.5 4.5S18 15 19.5 12s3-4.5 4.5-4.5" />
          </svg>
        </figure>
        <div className={styles.brandMeta}>
          <span className={styles.brandName}>Волнатека</span>
          <span className={styles.brandRole}>Admin</span>
        </div>
      </div>

      {/* ── Navigation ────────────────────────────────────── */}
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

      {/* ── Footer / Theme toggle ─────────────────────────── */}
      <div className={styles.foot}>
        <button
          className={styles.themeBtn}
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
        >
          <span className={styles.toggleTrack} data-on={theme === 'light' ? 'true' : 'false'}>
            <span className={styles.toggleThumb}>
              {theme === 'dark' ? <SvgMoon /> : <SvgSun />}
            </span>
          </span>
          <span className={styles.themeLabel}>
            {theme === 'dark' ? 'Тёмная тема' : 'Светлая тема'}
          </span>
        </button>
      </div>
    </aside>
  );
}

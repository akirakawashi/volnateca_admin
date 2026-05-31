import { NavLink } from 'react-router-dom';
import { useRedemptionQueue } from '../../contexts/redemptionQueue';
import styles from './Sidebar.module.css';

interface NavItem {
  to: string;
  label: string;
  badgeCount?: number | null;
  badgeCapped?: boolean;
}

const navItems: NavItem[] = [
  { to: '/', label: 'Главная' },
  { to: '/charts', label: 'Графики' },
  { to: '/users', label: 'Пользователь' },
  { to: '/store/prizes', label: 'Призы магазина' },
  { to: '/store/redemptions', label: 'Выдача призов', badgeCount: null },
  { to: '/quiz/create', label: 'Создать квиз' },
  { to: '/tasks/promo-codes', label: 'Задание Меняйки' },
  { to: '/wall/post', label: 'Создать пост' },
  { to: '/broadcast', label: 'VK-рассылка' },
  { to: '/message-templates', label: 'Шаблоны' },
];

interface SidebarProps {
  onLogout: () => void;
}

export function Sidebar({ onLogout }: SidebarProps) {
  const { queueCount, queueCountCapped } = useRedemptionQueue();

  const items: NavItem[] = navItems.map((item) =>
    item.to === '/store/redemptions'
      ? { ...item, badgeCount: queueCount, badgeCapped: queueCountCapped }
      : item,
  );

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandMeta}>
          <span className={styles.brandName}>Волнатека</span>
          <span className={styles.brandRole}>Control room</span>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Основное меню">
        <p className={styles.sectionLabel}>Навигация</p>
        <ul className={styles.navList} role="list">
          {items.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  [styles.navLink, isActive ? styles.active : ''].filter(Boolean).join(' ')
                }
              >
                <span className={styles.navLabel}>{item.label}</span>
                {item.badgeCount != null && item.badgeCount > 0 && (
                  <span className={styles.navBadge} aria-label={`В очереди: ${item.badgeCount}`}>
                    {item.badgeCount}
                    {item.badgeCapped ? '+' : ''}
                  </span>
                )}
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
          <span className={styles.themeLabel}>Выйти</span>
        </button>
      </div>
    </aside>
  );
}

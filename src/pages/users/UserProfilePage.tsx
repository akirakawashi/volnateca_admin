import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  cancelPrizeRedemption,
  fulfillPrizeRedemption,
} from '../../api/prizeRedemptions';
import {
  getUserProfile,
  getUserReferrals,
  listUserPrizeRedemptions,
  listUserTaskCompletions,
  listUserTransactions,
} from '../../api/users';
import { Alert } from '../../components/ui/Alert/Alert';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import type { AdminPrizeRedemption } from '../../types/prizeRedemption';
import type {
  UserProfile,
  UserProfileTab,
  UserReferralRow,
  UserReferrals,
  UserTaskCompletion,
  UserTransaction,
} from '../../types/user';
import {
  buildVkUserUrl,
  formatRedemptionDateTime,
} from '../../utils/prizeRedemption';
import { hasMoreListPages, parseListPageParam } from '../../utils/userAdmin';
import { UserListPagination } from './UserListPagination';
import styles from './UserProfilePage.module.css';

const TABS: { id: UserProfileTab; label: string }[] = [
  { id: 'overview', label: 'Обзор' },
  { id: 'redemptions', label: 'Заявки' },
  { id: 'tasks', label: 'Задания' },
  { id: 'transactions', label: 'Транзакции' },
  { id: 'referrals', label: 'Рефералы' },
];

const REDEMPTION_STATUS_LABELS: Record<string, string> = {
  reserved: 'Ожидает выдачи',
  issued: 'Выдан',
  canceled: 'Отменён',
};

const TASK_STATUS_LABELS: Record<string, string> = {
  completed: 'Выполнено',
  rejected: 'Отклонено',
  pending: 'В ожидании',
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(date);
}

function parseTab(value: string | null): UserProfileTab {
  if (value && TABS.some((tab) => tab.id === value)) {
    return value as UserProfileTab;
  }
  return 'overview';
}

export function UserProfilePage() {
  const { usersId: usersIdParam } = useParams();
  const usersId = Number.parseInt(usersIdParam ?? '', 10);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get('tab'));

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [redemptions, setRedemptions] = useState<AdminPrizeRedemption[]>([]);
  const [tasks, setTasks] = useState<UserTaskCompletion[]>([]);
  const [transactions, setTransactions] = useState<UserTransaction[]>([]);
  const [referrals, setReferrals] = useState<UserReferrals | null>(null);

  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [listHasMore, setListHasMore] = useState(false);
  const [acting, setActing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<string | null>(null);

  const listPage = parseListPageParam(searchParams.get('page'));

  const loadProfile = useCallback(async () => {
    if (!Number.isFinite(usersId) || usersId <= 0) {
      setError('Некорректный ID пользователя');
      setProfile(null);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getUserProfile(usersId);
      setProfile(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [usersId]);

  const loadTabData = useCallback(async () => {
    if (!profile) {
      return;
    }

    setTabLoading(true);
    setError(null);
    try {
      if (activeTab === 'redemptions') {
        const data = await listUserPrizeRedemptions(profile.users_id, listPage);
        setRedemptions(data);
        setListHasMore(hasMoreListPages(data.length));
      } else if (activeTab === 'tasks') {
        const data = await listUserTaskCompletions(profile.users_id, listPage);
        setTasks(data);
        setListHasMore(hasMoreListPages(data.length));
      } else if (activeTab === 'transactions') {
        const data = await listUserTransactions(profile.users_id, listPage);
        setTransactions(data);
        setListHasMore(hasMoreListPages(data.length));
      } else if (activeTab === 'referrals') {
        setReferrals(await getUserReferrals(profile.users_id));
        setListHasMore(false);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setTabLoading(false);
    }
  }, [activeTab, listPage, profile]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadProfile();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadProfile]);

  useEffect(() => {
    if (!profile || activeTab === 'overview') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      void loadTabData();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, loadTabData, profile]);

  const goToListPage = useCallback(
    (nextPage: number) => {
      const next = new URLSearchParams(searchParams);
      if (nextPage <= 1) {
        next.delete('page');
      } else {
        next.set('page', String(nextPage));
      }
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  const setTab = (tab: UserProfileTab) => {
    const next = new URLSearchParams(searchParams);
    if (tab === 'overview') {
      next.delete('tab');
    } else {
      next.set('tab', tab);
    }
    next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const refreshRedemptions = useCallback(async () => {
    if (!profile) {
      return;
    }
    const data = await listUserPrizeRedemptions(profile.users_id, listPage);
    setRedemptions(data);
    setListHasMore(hasMoreListPages(data.length));
    await loadProfile();
  }, [listPage, loadProfile, profile]);

  const handleFulfill = async (redemption: AdminPrizeRedemption) => {
    setActing(true);
    setLastAction(null);
    try {
      await fulfillPrizeRedemption(redemption.prize_redemptions_id);
      setLastAction('Заявка отмечена как выданная');
      await refreshRedemptions();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActing(false);
    }
  };

  const handleCancel = async (redemption: AdminPrizeRedemption) => {
    const reason = window.prompt('Причина отмены (необязательно)') ?? '';
    setActing(true);
    setLastAction(null);
    try {
      await cancelPrizeRedemption(redemption.prize_redemptions_id, {
        cancel_reason: reason.trim() || null,
      });
      setLastAction('Заявка отменена, баллы возвращены');
      await refreshRedemptions();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setActing(false);
    }
  };

  const overviewStats = useMemo(() => {
    if (!profile) {
      return [];
    }
    return [
      { label: 'Баланс', value: `${profile.balance_points} ✦` },
      { label: 'Уровень', value: `${profile.current_level} · ${profile.level_name}` },
      { label: 'Заработано', value: `${profile.earned_points_total} ✦` },
      { label: 'Потрачено', value: `${profile.spent_points_total} ✦` },
      { label: 'Рефералов', value: String(profile.referrals_sent_count) },
      { label: 'Заявок в очереди', value: String(profile.redemptions_reserved_count) },
    ];
  }, [profile]);

  if (!Number.isFinite(usersId) || usersId <= 0) {
    return <Alert variant="error">Некорректный ID пользователя</Alert>;
  }

  if (loading) {
    return <p className={styles.loading}>Загрузка профиля…</p>;
  }

  if (!profile) {
    return (
      <div className={styles.page}>
        <Alert variant="error">{error ?? 'Пользователь не найден'}</Alert>
        <Link to="/users">← К поиску</Link>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Пользователь"
        title={profile.display_name}
        subtitle={
          <>
            VK {profile.vk_user_id}
            {profile.vk_screen_name ? ` · @${profile.vk_screen_name}` : ''}
            {!profile.is_active ? ' · неактивен' : ''}
          </>
        }
        aside={
          <div className={styles.heroActions}>
            <a
              href={buildVkUserUrl(profile.vk_user_id)}
              target="_blank"
              rel="noreferrer"
              className={styles.vkButton}
            >
              Открыть VK
            </a>
            <Link to="/users" className={styles.backLink}>
              ← Поиск
            </Link>
          </div>
        }
      />

      <nav className={styles.tabs} aria-label="Разделы профиля">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={[styles.tab, activeTab === tab.id ? styles.tabActive : ''].join(' ')}
            onClick={() => setTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error ? <Alert variant="error">{error}</Alert> : null}
      {lastAction ? <Alert variant="success">{lastAction}</Alert> : null}

      {activeTab === 'overview' ? (
        <Card className={styles.statsCard}>
          <dl className={styles.statsGrid}>
            {overviewStats.map((item) => (
              <div key={item.label} className={styles.statItem}>
                <dt>{item.label}</dt>
                <dd>{item.value}</dd>
              </div>
            ))}
          </dl>
          <p className={styles.metaLine}>
            Регистрация: {formatDateTime(profile.created_at)} · обновлён{' '}
            {formatDateTime(profile.updated_at)}
          </p>
        </Card>
      ) : null}

      {activeTab === 'redemptions' ? (
        <Card className={styles.tableCard}>
          {tabLoading ? (
            <p className={styles.loading}>Загрузка заявок…</p>
          ) : redemptions.length === 0 ? (
            <p className={styles.empty}>
              {listPage > 1 ? 'На этой странице записей нет.' : 'Заявок на призы нет.'}
            </p>
          ) : (
            <ul className={styles.list}>
              {redemptions.map((item) => (
                <li key={item.prize_redemptions_id} className={styles.listItem}>
                  <div>
                    <strong>{item.prize_name}</strong>
                    <p className={styles.itemMeta}>
                      {REDEMPTION_STATUS_LABELS[item.prize_redemption_status] ??
                        item.prize_redemption_status}{' '}
                      · код {item.redemption_code} · {item.points_spent} ✦
                    </p>
                    <p className={styles.itemMeta}>
                      {formatRedemptionDateTime(item.created_at)}
                    </p>
                  </div>
                  {item.prize_redemption_status === 'reserved' ? (
                    <div className={styles.itemActions}>
                      <Button
                        type="button"
                        disabled={acting}
                        onClick={() => void handleFulfill(item)}
                      >
                        Выдать
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={acting}
                        onClick={() => void handleCancel(item)}
                      >
                        Отменить
                      </Button>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
          <UserListPagination
            page={listPage}
            hasMore={listHasMore}
            loading={tabLoading}
            onPrev={() => goToListPage(listPage - 1)}
            onNext={() => goToListPage(listPage + 1)}
          />
        </Card>
      ) : null}

      {activeTab === 'tasks' ? (
        <Card className={styles.tableCard}>
          {tabLoading ? (
            <p className={styles.loading}>Загрузка заданий…</p>
          ) : tasks.length === 0 ? (
            <p className={styles.empty}>
              {listPage > 1 ? 'На этой странице записей нет.' : 'Выполнений заданий нет.'}
            </p>
          ) : (
            <ul className={styles.list}>
              {tasks.map((item) => (
                <li key={item.task_completions_id} className={styles.listItem}>
                  <div>
                    <strong>{item.task_name}</strong>
                    <p className={styles.itemMeta}>
                      {TASK_STATUS_LABELS[item.task_completion_status] ??
                        item.task_completion_status}{' '}
                      · +{item.points_awarded} ✦ · ключ {item.completion_key}
                    </p>
                    <p className={styles.itemMeta}>
                      {formatDateTime(item.checked_at)}
                      {item.rejected_reason ? ` · ${item.rejected_reason}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <UserListPagination
            page={listPage}
            hasMore={listHasMore}
            loading={tabLoading}
            onPrev={() => goToListPage(listPage - 1)}
            onNext={() => goToListPage(listPage + 1)}
          />
        </Card>
      ) : null}

      {activeTab === 'transactions' ? (
        <Card className={styles.tableCard}>
          {tabLoading ? (
            <p className={styles.loading}>Загрузка транзакций…</p>
          ) : transactions.length === 0 ? (
            <p className={styles.empty}>
              {listPage > 1 ? 'На этой странице записей нет.' : 'Транзакций нет.'}
            </p>
          ) : (
            <ul className={styles.list}>
              {transactions.map((item) => (
                <li key={item.transactions_id} className={styles.listItem}>
                  <div>
                    <strong>
                      {item.transaction_type === 'accrual' ? '+' : '−'}
                      {item.amount} ✦
                    </strong>
                    <p className={styles.itemMeta}>
                      {item.transaction_source} · баланс {item.balance_after} ✦
                    </p>
                    <p className={styles.itemMeta}>
                      {formatDateTime(item.created_at)}
                      {item.description ? ` · ${item.description}` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <UserListPagination
            page={listPage}
            hasMore={listHasMore}
            loading={tabLoading}
            onPrev={() => goToListPage(listPage - 1)}
            onNext={() => goToListPage(listPage + 1)}
          />
        </Card>
      ) : null}

      {activeTab === 'referrals' ? (
        <Card className={styles.tableCard}>
          {tabLoading ? (
            <p className={styles.loading}>Загрузка рефералов…</p>
          ) : (
            <div className={styles.referrals}>
              <section>
                <h2 className={styles.sectionTitle}>Кто пригласил</h2>
                {referrals?.invited_by ? (
                  <ReferralRow row={referrals.invited_by} />
                ) : (
                  <p className={styles.empty}>Нет данных о пригласившем.</p>
                )}
              </section>
              <section>
                <h2 className={styles.sectionTitle}>Кого пригласил</h2>
                {referrals && referrals.invited_users.length > 0 ? (
                  <ul className={styles.list}>
                    {referrals.invited_users.map((row) => (
                      <li key={row.referrals_id}>
                        <ReferralRow row={row} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={styles.empty}>Пока никого не пригласил.</p>
                )}
              </section>
            </div>
          )}
        </Card>
      ) : null}
    </div>
  );
}

function ReferralRow({ row }: { row: UserReferralRow }) {
  return (
    <div className={styles.referralRow}>
      <Link to={`/users/${row.users_id}`} className={styles.resultLink}>
        {row.display_name}
      </Link>
      <span className={styles.itemMeta}>
        VK {row.vk_user_id} · {formatDateTime(row.created_at)}
        {row.bonus_transactions_id
          ? ` · бонус tx #${row.bonus_transactions_id}`
          : ' · бонус не начислен'}
      </span>
    </div>
  );
}

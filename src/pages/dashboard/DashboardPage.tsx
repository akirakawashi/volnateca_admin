// TODO DEV: удалить DEV-импорты и секции devPanel/dangerPanel перед релизом.
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { Alert } from '../../components/ui/Alert/Alert';
import { Field, Input } from '../../components/ui/Field/Field';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import { useAutoStatusMessage } from '../../hooks/useAutoStatusMessage';
import { useTruncateDB } from '../../hooks/useTruncateDB'; // TODO DEV
import { useSeedScenario } from '../../hooks/useSeedScenario'; // TODO DEV
import { useSeedStorePrizes } from '../../hooks/useSeedStorePrizes'; // TODO DEV
import { useAwardMonthlyTop } from '../../hooks/useAwardMonthlyTop';
import type { SeedDevScenario } from '../../api/dev'; // TODO DEV
import type { AwardMonthlyTopResponse } from '../../types/monthly_top';
import { adminDashboardLinks } from '../../navigation/adminNavigation';
import { formatMonthlyTopAwardLine } from '../../utils/monthlyTop';
import styles from './DashboardPage.module.css';

type ProdAction = {
  key: string;
  label: string;
  variant: 'primary' | 'secondary';
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
};

type SeedButton = {
  key: string;
  label: string;
  scenario: SeedDevScenario;
  color: 'primary' | 'secondary' | 'ghost';
};

// TODO DEV: удалить seedButtons перед релизом.
const seedButtons: SeedButton[] = [
  { key: 'monthly_top', label: 'Топ-10 месяца (seed)', scenario: 'monthly_top', color: 'secondary' },
  { key: 'project12', label: 'Все 12 недель', scenario: 'project12', color: 'secondary' },
  { key: 'referral3', label: 'Рефералы: 3 друга', scenario: 'referral3', color: 'ghost' },
  { key: 'referral5', label: 'Рефералы: 5 друзей', scenario: 'referral5', color: 'ghost' },
  { key: 'referral10', label: 'Рефералы: 10 друзей', scenario: 'referral10', color: 'ghost' },
];

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getPreviousMonthKey(): string {
  const now = new Date();
  return formatMonthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
}

export function DashboardPage() {
  const navigate = useNavigate();
  const [confirmPending, setConfirmPending] = useState(false);
  const [monthlyTopConfirmOpen, setMonthlyTopConfirmOpen] = useState(false);
  const [done, setDone] = useState(false);
  const prodStatusRef = useRef<HTMLDivElement>(null);
  const devStatusRef = useRef<HTMLDivElement>(null);
  const dangerStatusRef = useRef<HTMLDivElement>(null);
  // TODO DEV: удалить хуки truncate/seed перед релизом.
  const { truncate, loading: truncateLoading, error: truncateError, reset: resetTruncate } = useTruncateDB();
  const { seed, loading: seedLoading, error: seedError, reset: resetSeed } = useSeedScenario();
  const {
    seedStore,
    loading: storeSeedLoading,
    error: storeSeedError,
    reset: resetStoreSeed,
  } = useSeedStorePrizes();
  const { award, loading: awardLoading, error: awardError, reset: resetAward } = useAwardMonthlyTop();

  // TODO DEV: удалить state/handlers truncate и seed перед релизом.
  const [seedResult, setSeedResult] = useState<{ scenario: SeedDevScenario; messages: string[] } | null>(null);
  const [storeSeedResult, setStoreSeedResult] = useState<string[] | null>(null);
  const [awardResult, setAwardResult] = useState<AwardMonthlyTopResponse | null>(null);
  const [awardMonth, setAwardMonth] = useState(getPreviousMonthKey);
  const [activeScenario, setActiveScenario] = useState<SeedDevScenario | null>(null);

  const handleTruncateClick = () => {
    resetTruncate();
    setDone(false);
    setConfirmPending(true);
  };

  const handleConfirm = async () => {
    const ok = await truncate();
    setConfirmPending(false);
    if (ok) setDone(true);
  };

  const handleCancel = () => {
    setConfirmPending(false);
    resetTruncate();
  };

  const handleSeed = async (scenario: SeedDevScenario) => {
    resetSeed();
    setSeedResult(null);
    setStoreSeedResult(null);
    setAwardResult(null);
    setActiveScenario(scenario);
    try {
      const messages = await seed({ scenario, users_id: 1 });
      setSeedResult({ scenario, messages });
    } finally {
      setActiveScenario(null);
    }
  };

  const handleSeedStorePrizes = async () => {
    resetStoreSeed();
    setSeedResult(null);
    setStoreSeedResult(null);
    setAwardResult(null);
    try {
      const messages = await seedStore();
      setStoreSeedResult(messages);
    } catch {
      // Error text is exposed through storeSeedError.
    }
  };

  const handleAwardMonthlyTopClick = () => {
    resetAward();
    setAwardResult(null);
    setSeedResult(null);
    setStoreSeedResult(null);
    setMonthlyTopConfirmOpen(true);
  };

  const handleAwardMonthlyTopConfirm = async () => {
    try {
      const result = await award({ month: awardMonth, limit: 10 });
      setAwardResult(result);
      setMonthlyTopConfirmOpen(false);
    } catch {
      // Error text is exposed through awardError.
    }
  };

  const handleAwardMonthlyTopCancel = () => {
    if (awardLoading) {
      return;
    }
    setMonthlyTopConfirmOpen(false);
  };

  const prodActions: ProdAction[] = [
    {
      key: 'monthly_top',
      label: 'Топ-10 месяца',
      variant: 'primary',
      loading: awardLoading,
      disabled: awardLoading || !awardMonth,
      onClick: handleAwardMonthlyTopClick,
    },
    {
      key: 'broadcast',
      label: 'VK-рассылка',
      variant: 'secondary',
      disabled: awardLoading,
      onClick: () => navigate('/broadcast'),
    },
  ];

  const prodError = awardError;
  const hasProdStatus = Boolean(prodError || awardResult);
  const hasProdSuccess = Boolean(awardResult);

  const devError = seedError || storeSeedError;
  const hasDevStatus = Boolean(devError || seedResult || storeSeedResult);
  const hasDevSuccess = Boolean(seedResult || storeSeedResult);
  const hasDangerStatus = Boolean(done || truncateError);

  useAutoStatusMessage({
    active: hasProdStatus,
    scrollRef: prodStatusRef,
    onDismiss: hasProdSuccess ? () => setAwardResult(null) : undefined,
  });

  useAutoStatusMessage({
    active: hasDevStatus,
    scrollRef: devStatusRef,
    onDismiss: hasDevSuccess
      ? () => {
          setSeedResult(null);
          setStoreSeedResult(null);
        }
      : undefined,
  });

  useAutoStatusMessage({
    active: hasDangerStatus,
    scrollRef: dangerStatusRef,
    onDismiss: done ? () => setDone(false) : undefined,
  });

  return (
    <div className={styles.root}>
      <PageHero
        eyebrow="Волнатека Admin"
        title="Добро пожаловать"
        subtitle="Управление контентом проекта Волнатека"
        aside={
          <div className={styles.heroPanel} aria-hidden="true">
            <div className={styles.heroPill}>
              <span className={styles.heroPillDot} />
              <span>Онлайн</span>
            </div>
            <div className={styles.heroMetrics}>
              <div>
                <span>Разделы</span>
                <strong>{adminDashboardLinks.length}</strong>
              </div>
              <div>
                <span>PROD</span>
                <strong>{prodActions.length}</strong>
              </div>
              <div>
                <span>DEV</span>
                <strong>{seedButtons.length + 1}</strong>
              </div>
            </div>
          </div>
        }
        asideClassName={styles.heroAside}
      />

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>Быстрые действия</h2>
          <span className={styles.sectionMeta}>Контент</span>
        </div>
        <div className={styles.actionGrid}>
          {adminDashboardLinks.map((item) => (
            <Link key={item.to} to={item.to} className={styles.actionCard}>
              <div className={styles.actionText}>
                <span className={styles.actionName}>{item.title}</span>
                <span className={styles.actionDesc}>{item.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.prodPanel}>
        <header className={styles.panelHead}>
          <div className={styles.panelTitleWrap}>
            <span className={styles.prodTag}>PROD</span>
            <div className={styles.panelHeadText}>
              <p className={styles.panelTitle}>Production-сценарии</p>
              <p className={styles.panelSub}>Операции для боевого окружения</p>
            </div>
          </div>
        </header>

        <div className={styles.panelBody}>
          {hasProdStatus && (
            <div ref={prodStatusRef} className={styles.statusStack}>
              {prodError && <Alert variant="error">{prodError}</Alert>}

              {awardResult && (
                <Alert variant={awardResult.achievement_found ? 'info' : 'error'}>
                  <div className={styles.resultBox}>
                    <strong>
                      Начисление monthly_top_10 за {awardResult.month}
                    </strong>
                    {!awardResult.achievement_found && (
                      <p>Достижение monthly_top_10 не найдено в каталоге.</p>
                    )}
                    {awardResult.awards.length === 0 && awardResult.achievement_found && (
                      <p>Нет пользователей с начислениями за выбранный месяц.</p>
                    )}
                    {awardResult.awards.length > 0 && (
                      <ul className={styles.resultList}>
                        {awardResult.awards.map((award) => (
                          <li key={`${award.users_id}-${award.rank}`}>
                            {formatMonthlyTopAwardLine(award)}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Alert>
              )}
            </div>
          )}

          <div className={styles.monthlyTopControls}>
            <Field label="Месяц для топ-10">
              <Input
                type="month"
                value={awardMonth}
                disabled={awardLoading}
                onChange={(event) => setAwardMonth(event.target.value)}
              />
            </Field>
          </div>

          <div className={styles.prodRow}>
            {prodActions.map((action) => (
              <Button
                key={action.key}
                variant={action.variant}
                size="sm"
                loading={action.loading}
                disabled={action.disabled}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {monthlyTopConfirmOpen && (
        <div
          className={styles.modalOverlay}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleAwardMonthlyTopCancel();
            }
          }}
        >
          <div
            className={styles.modalDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="monthly-top-confirm-title"
          >
            <div className={styles.modalHead}>
              <span className={styles.prodTag}>PROD</span>
              <h2 id="monthly-top-confirm-title" className={styles.modalTitle}>
                Начислить топ-10 месяца
              </h2>
            </div>
            <dl className={styles.confirmDetails}>
              <div>
                <dt>Месяц</dt>
                <dd>{awardMonth}</dd>
              </div>
              <div>
                <dt>Достижение</dt>
                <dd>monthly_top_10</dd>
              </div>
              <div>
                <dt>Лимит</dt>
                <dd>10 пользователей</dd>
              </div>
            </dl>
            <p className={styles.modalText}>
              Начисление отправит награду выбранным пользователям и запишет результат операции.
            </p>
            <div className={styles.modalActions}>
              <Button variant="secondary" size="sm" disabled={awardLoading} onClick={handleAwardMonthlyTopCancel}>
                Отмена
              </Button>
              <Button
                variant="primary"
                size="sm"
                loading={awardLoading}
                disabled={!awardMonth}
                onClick={handleAwardMonthlyTopConfirm}
              >
                Начислить
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TODO DEV: удалить секцию devPanel перед релизом. */}
      <section className={styles.devPanel}>
        <header className={styles.panelHead}>
          <div className={styles.panelTitleWrap}>
            <span className={styles.devTag}>DEV</span>
            <div className={styles.panelHeadText}>
              <p className={styles.panelTitle}>Dev-сценарии</p>
              <p className={styles.panelSub}>Засеять БД для ручного тестирования</p>
            </div>
          </div>
        </header>

        <div className={styles.panelBody}>
          {hasDevStatus && (
            <div ref={devStatusRef} className={styles.statusStack}>
              {devError && <Alert variant="error">{devError}</Alert>}

              {seedResult && (
                <Alert variant="info">
                  <div className={styles.resultBox}>
                    <strong>Сценарий «{seedResult.scenario}» выполнен</strong>
                    <ul className={styles.resultList}>
                      {seedResult.messages.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </Alert>
              )}

              {storeSeedResult && (
                <Alert variant="info">
                  <div className={styles.resultBox}>
                    <strong>Тестовые призы магазина засеяны</strong>
                    <ul className={styles.resultList}>
                      {storeSeedResult.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </Alert>
              )}
            </div>
          )}

          <div className={styles.chipGrid}>
            {seedButtons.map((btn) => (
              <Button
                key={btn.key}
                variant={btn.color}
                size="sm"
                loading={seedLoading && activeScenario === btn.scenario}
                disabled={seedLoading || storeSeedLoading}
                onClick={() => handleSeed(btn.scenario)}
              >
                {btn.label}
              </Button>
            ))}
          </div>

          <div className={styles.awardRow}>
            <Button
              variant="secondary"
              size="sm"
              loading={storeSeedLoading}
              disabled={seedLoading}
              onClick={handleSeedStorePrizes}
            >
              Засеять тестовые призы магазина
            </Button>
          </div>
        </div>
      </section>

      {/* TODO DEV: удалить секцию dangerPanel (truncate) перед релизом. */}
      <section className={styles.dangerPanel}>
        <header className={styles.panelHead}>
          <div className={styles.panelTitleWrap}>
            <span className={styles.dangerIconWrap} aria-hidden="true">!</span>
            <div className={styles.panelHeadText}>
              <p className={styles.dangerTitle}>Опасная зона</p>
              <p className={styles.panelSub}>Только для DEBUG-режима</p>
            </div>
          </div>
        </header>

        <div className={styles.panelBody}>
          {hasDangerStatus && (
            <div ref={dangerStatusRef} className={styles.statusStack}>
              {done && <Alert variant="success">База данных очищена</Alert>}
              {truncateError && <Alert variant="error">{truncateError}</Alert>}
            </div>
          )}

          {!confirmPending ? (
            <div className={styles.dangerRow}>
              <div>
                <p className={styles.dangerActionTitle}>Очистить базу данных</p>
                <p className={styles.dangerActionMeta}>
                  TRUNCATE рабочих таблиц с RESTART IDENTITY CASCADE; справочники сохраняются
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={handleTruncateClick}>
                Очистить БД
              </Button>
            </div>
          ) : (
            <div className={styles.confirmBox}>
              <p className={styles.confirmText}>
                Все данные будут удалены без возможности восстановления. Продолжить?
              </p>
              <div className={styles.confirmActions}>
                <Button variant="secondary" size="sm" onClick={handleCancel}>
                  Отмена
                </Button>
                <Button variant="danger" size="sm" loading={truncateLoading} onClick={handleConfirm}>
                  Да, удалить всё
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

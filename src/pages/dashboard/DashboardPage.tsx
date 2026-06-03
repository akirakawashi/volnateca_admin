// TODO DEV: удалить DEV-импорты и секции devPanel/dangerPanel перед релизом.
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { Alert } from '../../components/ui/Alert/Alert';
import { Field } from '../../components/ui/Field/Field';
import { MonthPicker } from '../../components/ui/MonthPicker/MonthPicker';
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

const MONTHLY_TOP_MODAL_ANIM_MS = 500;

export function DashboardPage() {
  const [confirmPending, setConfirmPending] = useState(false);
  const [monthlyTopConfirmOpen, setMonthlyTopConfirmOpen] = useState(false);
  const [monthlyTopModalClosing, setMonthlyTopModalClosing] = useState(false);
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

  const monthlyTopModalVisible = monthlyTopConfirmOpen || monthlyTopModalClosing;

  const requestCloseMonthlyTopModal = useCallback(() => {
    if (awardLoading || monthlyTopModalClosing || !monthlyTopConfirmOpen) {
      return;
    }
    setMonthlyTopConfirmOpen(false);
    setMonthlyTopModalClosing(true);
  }, [awardLoading, monthlyTopConfirmOpen, monthlyTopModalClosing]);

  useEffect(() => {
    if (!monthlyTopModalClosing) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setMonthlyTopModalClosing(false);
    }, MONTHLY_TOP_MODAL_ANIM_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [monthlyTopModalClosing]);

  useEffect(() => {
    if (!monthlyTopConfirmOpen) {
      return undefined;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        requestCloseMonthlyTopModal();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [monthlyTopConfirmOpen, requestCloseMonthlyTopModal]);

  const handleAwardMonthlyTopClick = () => {
    resetAward();
    setAwardResult(null);
    setSeedResult(null);
    setStoreSeedResult(null);
    setMonthlyTopModalClosing(false);
    setMonthlyTopConfirmOpen(true);
  };

  const handleAwardMonthlyTopConfirm = async () => {
    try {
      const result = await award({ month: awardMonth, limit: 10 });
      setAwardResult(result);
      setMonthlyTopConfirmOpen(false);
      setMonthlyTopModalClosing(true);
    } catch {
      // Error text is exposed through awardError.
    }
  };

  const handleAwardMonthlyTopCancel = () => {
    requestCloseMonthlyTopModal();
  };

  const prodActions: ProdAction[] = [
    {
      key: 'monthly_top',
      label: 'Выдать топ-10 за месяц',
      variant: 'primary',
      loading: awardLoading,
      disabled: awardLoading || !awardMonth,
      onClick: handleAwardMonthlyTopClick,
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
        eyebrow="Главная"
        title="Панель управления"
        subtitle="Контент, магазин и операции проекта"
        aside={
          <div className={styles.headerStats}>
            <span className={styles.statChip}>
              <span className={styles.statLabel}>Разделы</span>
              <strong>{adminDashboardLinks.length}</strong>
            </span>
            <span className={styles.statChip}>
              <span className={styles.statLabel}>PROD</span>
              <strong>{prodActions.length}</strong>
            </span>
            <span className={[styles.statChip, styles.statChipMuted].join(' ')}>
              <span className={styles.statLabel}>DEV</span>
              <strong>{seedButtons.length + 1}</strong>
            </span>
          </div>
        }
      />

      <div className={styles.workspace}>
        <section className={styles.navColumn} aria-labelledby="dashboard-nav-title">
          <div className={styles.columnHead}>
            <h2 id="dashboard-nav-title" className={styles.columnTitle}>
              Разделы
            </h2>
            <span className={styles.columnHint}>Контент</span>
          </div>
          <ul className={styles.linkList}>
            {adminDashboardLinks.map((item) => (
              <li key={item.to}>
                <Link to={item.to} className={styles.linkRow}>
                  <span className={styles.linkMain}>
                    <span className={styles.linkName}>{item.title}</span>
                    <span className={styles.linkDesc}>{item.description}</span>
                  </span>
                  <span className={styles.linkArrow} aria-hidden="true">
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className={styles.opsColumn}>
          <section className={styles.opsBlock} aria-labelledby="dashboard-prod-title">
            <header className={styles.opsHead}>
              <div className={styles.opsHeadText}>
                <span className={styles.prodTag}>PROD</span>
                <h2 id="dashboard-prod-title" className={styles.opsTitle}>
                  Production
                </h2>
                <p className={styles.opsSub}>Операции для боевого окружения</p>
              </div>
            </header>

            <div className={styles.opsBody}>
              {hasProdStatus && (
                <div ref={prodStatusRef} className={styles.statusStack}>
                  {prodError && <Alert variant="error">{prodError}</Alert>}

                  {awardResult && (
                    <Alert variant={awardResult.achievement_found ? 'info' : 'error'}>
                      <div className={styles.resultBox}>
                        <strong>Начисление monthly_top_10 за {awardResult.month}</strong>
                        {!awardResult.achievement_found && (
                          <p>Достижение monthly_top_10 не найдено в каталоге.</p>
                        )}
                        {awardResult.awards.length === 0 && awardResult.achievement_found && (
                          <p>Нет пользователей с начислениями за выбранный месяц.</p>
                        )}
                        {awardResult.awards.length > 0 && (
                          <ul className={styles.resultList}>
                            {awardResult.awards.map((awardItem) => (
                              <li key={`${awardItem.users_id}-${awardItem.rank}`}>
                                {formatMonthlyTopAwardLine(awardItem)}
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
                  <MonthPicker
                    value={awardMonth}
                    disabled={awardLoading}
                    onChange={setAwardMonth}
                  />
                </Field>
              </div>

              <div className={styles.actionRow}>
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

          {/* TODO DEV: удалить секцию devPanel перед релизом. */}
          <section className={styles.opsBlock} aria-labelledby="dashboard-dev-title">
            <header className={styles.opsHead}>
              <div className={styles.opsHeadText}>
                <span className={styles.devTag}>DEV</span>
                <h2 id="dashboard-dev-title" className={styles.opsTitle}>
                  Dev-сценарии
                </h2>
                <p className={styles.opsSub}>Засеять БД для ручного тестирования</p>
              </div>
            </header>

            <div className={styles.opsBody}>
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
          </section>

          {/* TODO DEV: удалить секцию dangerPanel (truncate) перед релизом. */}
          <section
            className={[styles.opsBlock, styles.opsBlockDanger].join(' ')}
            aria-labelledby="dashboard-danger-title"
          >
            <header className={styles.opsHead}>
              <div className={styles.opsHeadText}>
                <span className={styles.dangerTag} aria-hidden="true">
                  !
                </span>
                <h2 id="dashboard-danger-title" className={styles.opsTitle}>
                  Опасная зона
                </h2>
                <p className={styles.opsSub}>Только для DEBUG-режима</p>
              </div>
            </header>

            <div className={styles.opsBody}>
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
      </div>

      {monthlyTopModalVisible && (
        <div
          className={[
            styles.modalOverlay,
            monthlyTopModalClosing ? styles.modalOverlayExit : styles.modalOverlayEnter,
          ].join(' ')}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              requestCloseMonthlyTopModal();
            }
          }}
        >
          <div
            className={[
              styles.modalClip,
              monthlyTopModalClosing ? styles.modalClipExit : styles.modalClipEnter,
            ].join(' ')}
            role="dialog"
            aria-modal="true"
            aria-labelledby="monthly-top-confirm-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.modalGlass} aria-hidden="true" />
            <div className={styles.modalDialog}>
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
        </div>
      )}
    </div>
  );
}

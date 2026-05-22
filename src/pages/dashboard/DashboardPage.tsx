import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { Alert } from '../../components/ui/Alert/Alert';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import { useAutoStatusMessage } from '../../hooks/useAutoStatusMessage';
import { useTruncateDB } from '../../hooks/useTruncateDB';
import { useSeedScenario } from '../../hooks/useSeedScenario';
import { useSeedStorePrizes } from '../../hooks/useSeedStorePrizes';
import { useAwardMonthlyTop } from '../../hooks/useAwardMonthlyTop';
import type { SeedDevScenario } from '../../api/dev';
import styles from './DashboardPage.module.css';

interface QuickLink {
  to: string;
  title: string;
  description: string;
}

const quickLinks: QuickLink[] = [
  {
    to: '/store/prizes',
    title: 'Призы магазина',
    description: 'Добавить мерч, партнёрский приз или суперприз в каталог',
  },
  {
    to: '/quiz/create',
    title: 'Создать квиз',
    description: 'Новое задание типа «Викторина» с вопросами и вариантами ответов',
  },
  {
    to: '/wall/post',
    title: 'Пост на стене',
    description: 'Опубликовать запись от имени сообщества ВКонтакте',
  },
];

type SeedButton = {
  key: string;
  label: string;
  scenario: SeedDevScenario;
  color: 'primary' | 'secondary' | 'ghost';
};

const seedButtons: SeedButton[] = [
  { key: 'week', label: 'Все задания недели', scenario: 'week', color: 'secondary' },
  { key: 'monthly_top', label: 'Топ-10 месяца (seed)', scenario: 'monthly_top', color: 'secondary' },
  { key: 'project12', label: 'Все 12 недель', scenario: 'project12', color: 'secondary' },
  { key: 'referral3', label: 'Рефералы: 3 друга', scenario: 'referral3', color: 'ghost' },
  { key: 'referral5', label: 'Рефералы: 5 друзей', scenario: 'referral5', color: 'ghost' },
  { key: 'referral10', label: 'Рефералы: 10 друзей', scenario: 'referral10', color: 'ghost' },
];

export function DashboardPage() {
  const [confirmPending, setConfirmPending] = useState(false);
  const [done, setDone] = useState(false);
  const devStatusRef = useRef<HTMLDivElement>(null);
  const dangerStatusRef = useRef<HTMLDivElement>(null);
  const { truncate, loading: truncateLoading, error: truncateError, reset: resetTruncate } = useTruncateDB();
  const { seed, loading: seedLoading, error: seedError, reset: resetSeed } = useSeedScenario();
  const {
    seedStore,
    loading: storeSeedLoading,
    error: storeSeedError,
    reset: resetStoreSeed,
  } = useSeedStorePrizes();
  const { award, loading: awardLoading, error: awardError, reset: resetAward } = useAwardMonthlyTop();

  const [seedResult, setSeedResult] = useState<{ scenario: SeedDevScenario; messages: string[] } | null>(null);
  const [storeSeedResult, setStoreSeedResult] = useState<string[] | null>(null);
  const [awardResult, setAwardResult] = useState<string[] | null>(null);
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

  const handleAwardMonthlyTop = async () => {
    resetAward();
    setAwardResult(null);
    setSeedResult(null);
    setStoreSeedResult(null);
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    try {
      const messages = await award({ month, limit: 10 });
      setAwardResult(messages);
    } catch {
      // Error text is exposed through awardError.
    }
  };

  const devError = seedError || storeSeedError || awardError;
  const hasDevStatus = Boolean(devError || seedResult || storeSeedResult || awardResult);
  const hasDevSuccess = Boolean(seedResult || storeSeedResult || awardResult);
  const hasDangerStatus = Boolean(done || truncateError);

  useAutoStatusMessage({
    active: hasDevStatus,
    scrollRef: devStatusRef,
    onDismiss: hasDevSuccess
      ? () => {
          setSeedResult(null);
          setStoreSeedResult(null);
          setAwardResult(null);
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
                <strong>5</strong>
              </div>
              <div>
                <span>DEV</span>
                <strong>{seedButtons.length + 2}</strong>
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
          {quickLinks.map((item) => (
            <Link key={item.to} to={item.to} className={styles.actionCard}>
              <div className={styles.actionText}>
                <span className={styles.actionName}>{item.title}</span>
                <span className={styles.actionDesc}>{item.description}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

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

              {awardResult && (
                <Alert variant="info">
                  <div className={styles.resultBox}>
                    <strong>Начисление monthly_top_10 выполнено</strong>
                    <ul className={styles.resultList}>
                      {awardResult.map((m, i) => (
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
              variant="primary"
              size="sm"
              loading={awardLoading}
              disabled={seedLoading || storeSeedLoading}
              onClick={handleAwardMonthlyTop}
            >
              Начислить monthly_top_10 за текущий месяц
            </Button>
            <Button
              variant="secondary"
              size="sm"
              loading={storeSeedLoading}
              disabled={seedLoading || awardLoading}
              onClick={handleSeedStorePrizes}
            >
              Засеять тестовые призы магазина
            </Button>
          </div>
        </div>
      </section>

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
                  TRUNCATE всех таблиц с RESTART IDENTITY CASCADE
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

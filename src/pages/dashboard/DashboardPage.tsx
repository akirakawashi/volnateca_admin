import { useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { Alert } from '../../components/ui/Alert/Alert';
import { useTruncateDB } from '../../hooks/useTruncateDB';
import { useSeedScenario } from '../../hooks/useSeedScenario';
import { useAwardMonthlyTop } from '../../hooks/useAwardMonthlyTop';
import styles from './DashboardPage.module.css';

interface QuickLink {
  to: string;
  icon: ReactNode;
  title: string;
  description: string;
}

function IconQuizAdd() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="2" width="16" height="20" rx="2.5" />
      <path d="M9 7h6M9 12h6M9 17h4" />
      <circle cx="18" cy="18" r="4" fill="currentColor" stroke="none" />
      <line x1="18" y1="16" x2="18" y2="20" stroke="white" strokeWidth="1.5" />
      <line x1="16" y1="18" x2="20" y2="18" stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

function IconWallPost() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SvgChevron() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function SvgWarning() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

const quickLinks: QuickLink[] = [
  {
    to: '/quiz/create',
    icon: <IconQuizAdd />,
    title: 'Создать квиз',
    description: 'Новое задание типа «Викторина» с вопросами и вариантами ответов',
  },
  {
    to: '/wall/post',
    icon: <IconWallPost />,
    title: 'Пост на стене',
    description: 'Опубликовать запись от имени сообщества ВКонтакте',
  },
];

type SeedButton = {
  key: string;
  label: string;
  scenario: string;
  color: 'primary' | 'secondary' | 'ghost';
};

const seedButtons: SeedButton[] = [
  { key: 'daily7', label: 'Стрик 7 дней', scenario: 'daily7', color: 'secondary' },
  { key: 'daily30', label: 'Стрик 30 дней', scenario: 'daily30', color: 'secondary' },
  { key: 'quiz5', label: '5 правильных викторин подряд', scenario: 'quiz5', color: 'secondary' },
  { key: 'quiz-broken', label: 'Quiz streak (сбит)', scenario: 'quiz-broken', color: 'secondary' },
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
  const { truncate, loading: truncateLoading, error: truncateError, reset: resetTruncate } = useTruncateDB();
  const { seed, loading: seedLoading, error: seedError, reset: resetSeed } = useSeedScenario();
  const { award, loading: awardLoading, error: awardError, reset: resetAward } = useAwardMonthlyTop();

  const [seedResult, setSeedResult] = useState<{ scenario: string; messages: string[] } | null>(null);
  const [awardResult, setAwardResult] = useState<string[] | null>(null);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

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

  const handleSeed = async (scenario: string) => {
    resetSeed();
    setSeedResult(null);
    setActiveScenario(scenario);
    try {
      const messages = await seed({ scenario, users_id: 1 });
      setSeedResult({ scenario, messages });
    } finally {
      setActiveScenario(null);
    }
  };

  const handleAwardMonthlyTop = async () => {
    resetAward();
    setAwardResult(null);
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    try {
      const messages = await award({ month, limit: 10 });
      setAwardResult(messages);
    } catch {
    }
  };

  const anyError = truncateError || seedError || awardError;

  return (
    <div className={styles.root}>

      <header className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Добро пожаловать</h1>
          <p className={styles.heroSub}>Управление контентом проекта Волнатека</p>
        </div>
        <div className={styles.heroPill} aria-hidden="true">
          <span className={styles.heroPillDot} />
          <span>Онлайн</span>
        </div>
      </header>

      <section>
        <h2 className={styles.sectionTitle}>Быстрые действия</h2>
        <div className={styles.actionGrid}>
          {quickLinks.map((item) => (
            <Link key={item.to} to={item.to} className={styles.actionCard}>
              <div className={styles.actionIconRing}>
                {item.icon}
              </div>
              <div className={styles.actionText}>
                <span className={styles.actionName}>{item.title}</span>
                <span className={styles.actionDesc}>{item.description}</span>
              </div>
              <span className={styles.actionArrow}><SvgChevron /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.devPanel}>
        <header className={styles.panelHead}>
          <span className={styles.devTag}>DEV</span>
          <div className={styles.panelHeadText}>
            <p className={styles.panelTitle}>Dev-сценарии</p>
            <p className={styles.panelSub}>Засеять БД для ручного тестирования</p>
          </div>
        </header>

        <div className={styles.panelBody}>
          {anyError && <Alert variant="error">{anyError}</Alert>}

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

          <div className={styles.chipGrid}>
            {seedButtons.map((btn) => (
              <Button
                key={btn.key}
                variant={btn.color}
                size="sm"
                loading={seedLoading && activeScenario === btn.scenario}
                disabled={seedLoading}
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
              disabled={seedLoading}
              onClick={handleAwardMonthlyTop}
            >
              Начислить monthly_top_10 за текущий месяц
            </Button>
          </div>
        </div>
      </section>

      <section className={styles.dangerPanel}>
        <header className={styles.panelHead}>
          <span className={styles.dangerIconWrap}><SvgWarning /></span>
          <div className={styles.panelHeadText}>
            <p className={styles.dangerTitle}>Опасная зона</p>
            <p className={styles.panelSub}>Только для DEBUG-режима</p>
          </div>
        </header>

        <div className={styles.panelBody}>
          {done && <Alert variant="success">База данных очищена</Alert>}
          {truncateError && <Alert variant="error">{truncateError}</Alert>}

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

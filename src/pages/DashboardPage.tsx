import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Alert } from '../components/ui/Alert';
import { useTruncateDB } from '../hooks/useTruncateDB';
import { useSeedScenario } from '../hooks/useSeedScenario';
import { useAwardMonthlyTop } from '../hooks/useAwardMonthlyTop';
import styles from './DashboardPage.module.css';

interface QuickLink {
  to: string;
  icon: string;
  title: string;
  description: string;
}

const quickLinks: QuickLink[] = [
  {
    to: '/quiz/create',
    icon: '?',
    title: 'Создать квиз',
    description: 'Новое задание типа «Викторина» с вопросами и вариантами ответов',
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
      // handled by hook error state
    }
  };

  const anyError = truncateError || seedError || awardError;

  return (
    <div className={styles.page}>
      <div className={styles.heading}>
        <h1 className={styles.title}>Добро пожаловать</h1>
        <p className={styles.sub}>Управление контентом проекта Волнатека</p>
      </div>

      <div className={styles.grid}>
        {quickLinks.map((item) => (
          <Link key={item.to} to={item.to} className={styles.linkCard}>
            <Card>
              <div className={styles.linkInner}>
                <span className={styles.linkIcon}>{item.icon}</span>
                <div>
                  <div className={styles.linkTitle}>{item.title}</div>
                  <div className={styles.linkDesc}>{item.description}</div>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* TODO: удалить блок devZone (весь dev-сценарии + award-monthly-top) перед релизом. */}
      <div className={styles.devZone}>
        <div className={styles.devHeader}>
          <span className={styles.devIcon}>🧪</span>
          <div>
            <div className={styles.devTitle}>Dev-сценарии</div>
            <div className={styles.devSub}>Засеять БД для ручного тестирования</div>
          </div>
        </div>

        {anyError && (
          <Alert variant="error">{anyError}</Alert>
        )}

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

        <div className={styles.seedGrid}>
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

      {/* TODO: удалить блок dangerZone (truncate БД) перед релизом. */}
      <div className={styles.dangerZone}>
        <div className={styles.dangerHeader}>
          <span className={styles.dangerIcon}>⚠</span>
          <div>
            <div className={styles.dangerTitle}>Опасная зона</div>
            <div className={styles.dangerSub}>Только для DEBUG-режима</div>
          </div>
        </div>

        {done && (
          <Alert variant="success">База данных очищена</Alert>
        )}
        {truncateError && (
          <Alert variant="error">{truncateError}</Alert>
        )}

        {!confirmPending ? (
          <div className={styles.dangerRow}>
            <div>
              <div className={styles.dangerActionTitle}>Очистить базу данных</div>
              <div className={styles.dangerActionDesc}>
                TRUNCATE всех таблиц с RESTART IDENTITY CASCADE
              </div>
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
    </div>
  );
}

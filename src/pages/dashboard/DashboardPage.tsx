import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button/Button';
import { Alert } from '../../components/ui/Alert/Alert';
import { Field } from '../../components/ui/Field/Field';
import { MonthPicker } from '../../components/ui/MonthPicker/MonthPicker';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import { useAutoStatusMessage } from '../../hooks/useAutoStatusMessage';
import { useAwardMonthlyTop } from '../../hooks/useAwardMonthlyTop';
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

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getPreviousMonthKey(): string {
  const now = new Date();
  return formatMonthKey(new Date(now.getFullYear(), now.getMonth() - 1, 1));
}

const MONTHLY_TOP_MODAL_ANIM_MS = 500;

export function DashboardPage() {
  const [monthlyTopConfirmOpen, setMonthlyTopConfirmOpen] = useState(false);
  const [monthlyTopModalClosing, setMonthlyTopModalClosing] = useState(false);
  const prodStatusRef = useRef<HTMLDivElement>(null);
  const { award, loading: awardLoading, error: awardError, reset: resetAward } = useAwardMonthlyTop();

  const [awardResult, setAwardResult] = useState<AwardMonthlyTopResponse | null>(null);
  const [awardMonth, setAwardMonth] = useState(getPreviousMonthKey);

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

  useAutoStatusMessage({
    active: hasProdStatus,
    scrollRef: prodStatusRef,
    onDismiss: hasProdSuccess ? () => setAwardResult(null) : undefined,
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

import { useState } from 'react';
import { AccrualSourcesPieChart } from '../../components/stats/AccrualSourcesPieChart';
import { DailyAccrualPointsChart } from '../../components/stats/DailyAccrualPointsChart';
import { DailyActivityChart } from '../../components/stats/DailyActivityChart';
import { DailyNewUsersChart } from '../../components/stats/DailyNewUsersChart';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import { useAccrualSourcesStats } from '../../hooks/useAccrualSourcesStats';
import { useDailyAccrualPointsStats } from '../../hooks/useDailyAccrualPointsStats';
import { useDailyActivityStats } from '../../hooks/useDailyActivityStats';
import { useDailyNewUsersStats } from '../../hooks/useDailyNewUsersStats';
import type { StatsRangeDays } from '../../types/stats';
import styles from './ChartsPage.module.css';

type ChartTab = 'activity' | 'growth' | 'economy' | 'sources';

const chartTabs: { id: ChartTab; label: string; description: string }[] = [
  {
    id: 'activity',
    label: 'Активность',
    description:
      'Уникальные пользователи с начислением баллов за календарный день — пики вовлечённости и спокойные дни.',
  },
  {
    id: 'growth',
    label: 'Рост',
    description:
      'Новые регистрации в боте по дням. Сравнивайте с активностью: аудитория может расти без начислений в тот же день.',
  },
  {
    id: 'economy',
    label: 'Экономика',
    description:
      'Сумма начисленных баллов за день — отличает массовую активность от редких крупных начислений.',
  },
  {
    id: 'sources',
    label: 'Источники',
    description:
      'Структура начислений: задания, регистрация, рефералы, достижения и ручные корректировки.',
  },
];

export function ChartsPage() {
  const [activeTab, setActiveTab] = useState<ChartTab>('activity');
  const [activityRangeDays, setActivityRangeDays] = useState<StatsRangeDays>(30);
  const [growthRangeDays, setGrowthRangeDays] = useState<StatsRangeDays>(30);
  const [economyRangeDays, setEconomyRangeDays] = useState<StatsRangeDays>(30);
  const [sourcesRangeDays, setSourcesRangeDays] = useState<StatsRangeDays>(30);

  const {
    stats: activityStats,
    loading: activityLoading,
    error: activityError,
    refresh: refreshActivity,
  } = useDailyActivityStats(activityRangeDays);

  const {
    stats: growthStats,
    loading: growthLoading,
    error: growthError,
    refresh: refreshGrowth,
  } = useDailyNewUsersStats(growthRangeDays);

  const {
    stats: economyStats,
    loading: economyLoading,
    error: economyError,
    refresh: refreshEconomy,
  } = useDailyAccrualPointsStats(economyRangeDays);

  const {
    stats: sourcesStats,
    loading: sourcesLoading,
    error: sourcesError,
    refresh: refreshSources,
  } = useAccrualSourcesStats(sourcesRangeDays);

  const activeMeta = chartTabs.find((tab) => tab.id === activeTab)!;

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Аналитика"
        title="Графики"
        subtitle="Сводки по активности, росту и экономике проекта"
      />

      <div className={styles.shell}>
        <div className={styles.tabBar} role="tablist" aria-label="Разделы графиков">
          {chartTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className={[styles.tab, activeTab === tab.id ? styles.tabActive : '']
                .filter(Boolean)
                .join(' ')}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section
          className={styles.panel}
          role="tabpanel"
          aria-labelledby={`charts-tab-${activeTab}`}
        >
          <header className={styles.panelHead}>
            <h2 id={`charts-tab-${activeTab}`} className={styles.panelTitle}>
              {activeMeta.label}
            </h2>
            <p className={styles.panelDescription}>{activeMeta.description}</p>
          </header>

          {activeTab === 'activity' && (
            <DailyActivityChart
              stats={activityStats}
              loading={activityLoading}
              error={activityError}
              rangeDays={activityRangeDays}
              onRangeChange={setActivityRangeDays}
              onRefresh={() => void refreshActivity()}
            />
          )}

          {activeTab === 'growth' && (
            <DailyNewUsersChart
              stats={growthStats}
              loading={growthLoading}
              error={growthError}
              rangeDays={growthRangeDays}
              onRangeChange={setGrowthRangeDays}
              onRefresh={() => void refreshGrowth()}
            />
          )}

          {activeTab === 'economy' && (
            <DailyAccrualPointsChart
              stats={economyStats}
              loading={economyLoading}
              error={economyError}
              rangeDays={economyRangeDays}
              onRangeChange={setEconomyRangeDays}
              onRefresh={() => void refreshEconomy()}
            />
          )}

          {activeTab === 'sources' && (
            <AccrualSourcesPieChart
              stats={sourcesStats}
              loading={sourcesLoading}
              error={sourcesError}
              rangeDays={sourcesRangeDays}
              onRangeChange={setSourcesRangeDays}
              onRefresh={() => void refreshSources()}
            />
          )}
        </section>
      </div>
    </div>
  );
}

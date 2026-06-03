import { useState } from 'react';
import { DailyAccrualPointsChart } from '../../components/stats/DailyAccrualPointsChart';
import { DailyActivityChart } from '../../components/stats/DailyActivityChart';
import { DailyNewUsersChart } from '../../components/stats/DailyNewUsersChart';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import { useDailyAccrualPointsStats } from '../../hooks/useDailyAccrualPointsStats';
import { useDailyActivityStats } from '../../hooks/useDailyActivityStats';
import { useDailyNewUsersStats } from '../../hooks/useDailyNewUsersStats';
import type { StatsRangeDays } from '../../types/stats';
import styles from './ChartsPage.module.css';

export function ChartsPage() {
  const [activityRangeDays, setActivityRangeDays] = useState<StatsRangeDays>(30);
  const [growthRangeDays, setGrowthRangeDays] = useState<StatsRangeDays>(30);
  const [economyRangeDays, setEconomyRangeDays] = useState<StatsRangeDays>(30);

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

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Аналитика"
        title="Графики"
        subtitle="Сводки по проекту: активность, рост аудитории и другие метрики"
      />

      <section className={styles.section} aria-labelledby="charts-activity-title">
        <header className={styles.sectionHead}>
          <h2 id="charts-activity-title" className={styles.sectionTitle}>
            Активность
          </h2>
          <p className={styles.sectionDescription}>
            Сколько уникальных пользователей получили начисление баллов в каждый календарный день.
            Помогает увидеть пики вовлечённости и спокойные дни.
          </p>
        </header>

        <DailyActivityChart
          stats={activityStats}
          loading={activityLoading}
          error={activityError}
          rangeDays={activityRangeDays}
          onRangeChange={setActivityRangeDays}
          onRefresh={() => void refreshActivity()}
        />
      </section>

      <section className={styles.section} aria-labelledby="charts-growth-title">
        <header className={styles.sectionHead}>
          <h2 id="charts-growth-title" className={styles.sectionTitle}>
            Рост
          </h2>
          <p className={styles.sectionDescription}>
            Сколько новых участников зарегистрировалось в боте по дням. Сравнивайте с активностью:
            можно набрать аудиторию без начислений в тот же день.
          </p>
        </header>

        <DailyNewUsersChart
          stats={growthStats}
          loading={growthLoading}
          error={growthError}
          rangeDays={growthRangeDays}
          onRangeChange={setGrowthRangeDays}
          onRefresh={() => void refreshGrowth()}
        />
      </section>

      <section className={styles.section} aria-labelledby="charts-economy-title">
        <header className={styles.sectionHead}>
          <h2 id="charts-economy-title" className={styles.sectionTitle}>
            Экономика
          </h2>
          <p className={styles.sectionDescription}>
            Сколько баллов начислено за день в сумме. Помогает отличить дни с высокой активностью
            от дней, когда немного людей получили много баллов (топ месяца, крупные задания).
          </p>
        </header>

        <DailyAccrualPointsChart
          stats={economyStats}
          loading={economyLoading}
          error={economyError}
          rangeDays={economyRangeDays}
          onRangeChange={setEconomyRangeDays}
          onRefresh={() => void refreshEconomy()}
        />
      </section>
    </div>
  );
}

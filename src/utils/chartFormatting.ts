import type { StatsRangeDays } from '../types/stats';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
});

const axisFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: '2-digit',
});

export function formatChartDayLabel(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return dateFormatter.format(date);
}

export function formatChartAxisLabel(value: string): string {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return axisFormatter.format(date);
}

export function formatUsersCount(value: number): string {
  if (value === 1) {
    return '1 пользователь';
  }
  if (value > 1 && value < 5) {
    return `${value} пользователя`;
  }
  return `${value} пользователей`;
}

const pointsFormatter = new Intl.NumberFormat('ru-RU');

export function formatPointsAmount(value: number): string {
  return `${pointsFormatter.format(value)} ✦`;
}

export function formatNewUsersCount(value: number): string {
  if (value === 1) {
    return '1 новый участник';
  }
  if (value > 1 && value < 5) {
    return `${value} новых участника`;
  }
  return `${value} новых участников`;
}

export function getXAxisInterval(rangeDays: StatsRangeDays): number | 'preserveStartEnd' {
  return rangeDays <= 7 ? 0 : 'preserveStartEnd';
}

export function getMinTickGap(rangeDays: StatsRangeDays): number {
  if (rangeDays <= 7) {
    return 8;
  }
  if (rangeDays <= 30) {
    return 18;
  }
  return 28;
}

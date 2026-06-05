const ACCRUAL_SOURCE_LABELS: Record<string, string> = {
  registration: 'Регистрация',
  task: 'Задания',
  referral: 'Пригласить друга',
  achievement: 'Достижения',
  adjustment: 'Корректировки',
  prize: 'Возврат за приз',
};

const ACCRUAL_SOURCE_COLORS: Record<string, string> = {
  registration: '#8b93ff',
  task: '#4ecdc4',
  referral: '#ffd166',
  achievement: '#ff6b9d',
  adjustment: '#a78bfa',
  prize: '#94a3b8',
};

const FALLBACK_COLOR = '#64748b';

export function getAccrualSourceLabel(source: string): string {
  return ACCRUAL_SOURCE_LABELS[source] ?? source;
}

export function getAccrualSourceColor(source: string): string {
  return ACCRUAL_SOURCE_COLORS[source] ?? FALLBACK_COLOR;
}

export function formatAccrualShare(value: number, total: number): string {
  if (total <= 0) {
    return '0%';
  }
  const percent = (value / total) * 100;
  return `${percent.toLocaleString('ru-RU', { maximumFractionDigits: 1 })}%`;
}

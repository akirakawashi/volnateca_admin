import type { MonthlyTopAward, MonthlyTopAwardStatus } from '../types/monthly_top';

const STATUS_LABELS: Record<MonthlyTopAwardStatus, string> = {
  awarded: 'начислено',
  already_awarded: 'уже было начислено',
  user_not_registered: 'пользователь не зарегистрирован',
};

export function formatMonthlyTopAwardLine(award: MonthlyTopAward): string {
  const status = STATUS_LABELS[award.status];
  const pointsPart =
    award.status === 'awarded' && award.points_awarded > 0
      ? ` → +${award.points_awarded}`
      : '';
  const messagePart =
    award.status === 'awarded'
      ? award.message_sent
        ? ', сообщение отправлено'
        : ', сообщение не отправлено'
      : '';
  const levelPart = award.level_up != null ? `, уровень ${award.level_up}` : '';

  return (
    `#${award.rank} VK ${award.vk_user_id} — ${award.monthly_points} очков за месяц`
    + ` (${status}${pointsPart}${levelPart}${messagePart})`
  );
}

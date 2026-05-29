export type MonthlyTopAwardStatus = 'awarded' | 'already_awarded' | 'user_not_registered';

export interface MonthlyTopAward {
  rank: number;
  users_id: number;
  vk_user_id: number;
  monthly_points: number;
  status: MonthlyTopAwardStatus;
  points_awarded: number;
  balance_points: number | null;
  level_up: number | null;
  message_sent: boolean;
}

export interface AwardMonthlyTopPayload {
  month: string;
  limit?: number;
}

export interface AwardMonthlyTopResponse {
  month: string;
  period_start_at: string;
  period_end_at: string;
  achievement_found: boolean;
  awards: MonthlyTopAward[];
}

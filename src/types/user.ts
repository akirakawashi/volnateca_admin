export interface UserSearchHit {
  users_id: number;
  vk_user_id: number;
  display_name: string;
  vk_screen_name: string | null;
  balance_points: number;
  current_level: number;
}

export interface UserProfile {
  users_id: number;
  vk_user_id: number;
  first_name: string | null;
  last_name: string | null;
  vk_screen_name: string | null;
  display_name: string;
  balance_points: number;
  earned_points_total: number;
  spent_points_total: number;
  current_level: number;
  level_name: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  referrals_sent_count: number;
  redemptions_reserved_count: number;
}

export interface UserReferralRow {
  referrals_id: number;
  users_id: number;
  vk_user_id: number;
  display_name: string;
  vk_screen_name: string | null;
  bonus_transactions_id: number | null;
  created_at: string;
}

export interface UserReferrals {
  invited_by: UserReferralRow | null;
  invited_users: UserReferralRow[];
}

export interface UserTaskCompletion {
  task_completions_id: number;
  tasks_id: number;
  task_name: string;
  completion_key: string;
  task_completion_status: string;
  points_awarded: number;
  transactions_id: number | null;
  rejected_reason: string | null;
  checked_at: string | null;
}

export interface UserTransaction {
  transactions_id: number;
  users_id: number;
  tasks_id: number | null;
  prizes_id: number | null;
  transaction_type: string;
  transaction_source: string;
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string | null;
  created_at: string;
}

export type UserProfileTab =
  | 'overview'
  | 'redemptions'
  | 'tasks'
  | 'transactions'
  | 'referrals';

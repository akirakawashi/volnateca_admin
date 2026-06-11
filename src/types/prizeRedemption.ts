export const PRIZE_REDEMPTION_STATUSES = ['reserved', 'issued', 'canceled'] as const;

export type PrizeRedemptionStatus = (typeof PRIZE_REDEMPTION_STATUSES)[number];

export interface AdminPrizeRedemption {
  prize_redemptions_id: number;
  users_id: number;
  vk_user_id: number | null;
  prizes_id: number;
  prize_name: string;
  transactions_id: number;
  refund_transactions_id: number | null;
  prize_redemption_status: PrizeRedemptionStatus;
  receive_type: string;
  redemption_code: string;
  points_spent: number;
  comment: string | null;
  issued_at: string | null;
  canceled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  promo_code: string | null;
}

export interface ListPrizeRedemptionsParams {
  status?: PrizeRedemptionStatus | null;
  prizes_id?: number | null;
  page?: number;
}

export interface FulfillPrizeRedemptionPayload {
  comment?: string | null;
}

export interface CancelPrizeRedemptionPayload {
  cancel_reason?: string | null;
}

export const ADMIN_PRIZE_TYPES = ['merch', 'partner', 'super_prize'] as const;
export const ADMIN_RECEIVE_TYPES = ['pickup', 'delivery', 'manager_contact'] as const;
export const ADMIN_PRIZE_STATUSES = ['available', 'sold_out', 'hidden'] as const;

export type PrizeType = (typeof ADMIN_PRIZE_TYPES)[number];
export type PrizeReceiveType = (typeof ADMIN_RECEIVE_TYPES)[number];
export type PrizeStatus = (typeof ADMIN_PRIZE_STATUSES)[number];

export interface AdminPrize {
  prizes_id: number;
  code: string;
  prize_name: string;
  description: string | null;
  image_attachment: string | null;
  prize_type: PrizeType;
  receive_type: PrizeReceiveType;
  status: PrizeStatus;
  cost_points: number;
  quantity_total: number | null;
  quantity_claimed: number;
  required_level: number | null;
  sort_order: number;
  is_active: boolean;
}

export interface CreatePrizePayload {
  prize_name: string;
  description: string | null;
  image_attachment: string | null;
  prize_type: PrizeType;
  receive_type: PrizeReceiveType;
  status: PrizeStatus;
  cost_points: number;
  quantity_total: number | null;
  required_level: number | null;
  sort_order: number;
  is_active: boolean;
}

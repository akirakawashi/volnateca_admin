import { apiFetch } from './client';

export type SeedDevScenario =
  | 'week'
  | 'monthly_top'
  | 'project12'
  | 'referral3'
  | 'referral5'
  | 'referral10';

export interface SeedDevScenarioPayload {
  scenario: SeedDevScenario;
  users_id?: number;
}

export interface AwardMonthlyTopPayload {
  month: string;
  limit?: number;
}

export interface DevResponse {
  messages: string[];
}

export async function seedDevScenario(payload: SeedDevScenarioPayload): Promise<DevResponse> {
  return apiFetch<DevResponse>('/v1/admin/dev/seed', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function seedStorePrizes(): Promise<DevResponse> {
  return apiFetch<DevResponse>('/v1/admin/dev/seed-store-prizes', {
    method: 'POST',
  });
}

export async function awardMonthlyTop(payload: AwardMonthlyTopPayload): Promise<DevResponse> {
  return apiFetch<DevResponse>('/v1/admin/dev/award-monthly-top', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

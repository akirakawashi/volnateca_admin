import { apiFetch } from './client';
import type { AwardMonthlyTopPayload, AwardMonthlyTopResponse } from '../types/monthly_top';

export function awardMonthlyTop(payload: AwardMonthlyTopPayload): Promise<AwardMonthlyTopResponse> {
  return apiFetch<AwardMonthlyTopResponse>('/v1/admin/monthly-top/award', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

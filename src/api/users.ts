import { apiFetch } from './client';
import type { AdminListPage } from '../types/pagination';
import type { AdminPrizeRedemption } from '../types/prizeRedemption';
import type {
  UserProfile,
  UserReferrals,
  UserSearchHit,
  UserTaskCompletion,
  UserTransaction,
} from '../types/user';

const USERS_PATH = '/v1/admin/users';

export function searchUsers(query: string, limit = 20): Promise<UserSearchHit[]> {
  const params = new URLSearchParams({ q: query.trim(), limit: String(limit) });
  return apiFetch<UserSearchHit[]>(`${USERS_PATH}/search?${params.toString()}`);
}

export function getUserProfile(usersId: number): Promise<UserProfile> {
  return apiFetch<UserProfile>(`${USERS_PATH}/${usersId}`);
}

export function listUserPrizeRedemptions(
  usersId: number,
  page = 1,
): Promise<AdminListPage<AdminPrizeRedemption>> {
  const params = new URLSearchParams({ page: String(page) });
  return apiFetch<AdminListPage<AdminPrizeRedemption>>(
    `${USERS_PATH}/${usersId}/prize-redemptions?${params.toString()}`,
  );
}

export function listUserTaskCompletions(
  usersId: number,
  page = 1,
): Promise<AdminListPage<UserTaskCompletion>> {
  const params = new URLSearchParams({ page: String(page) });
  return apiFetch<AdminListPage<UserTaskCompletion>>(
    `${USERS_PATH}/${usersId}/task-completions?${params.toString()}`,
  );
}

export function listUserTransactions(
  usersId: number,
  page = 1,
): Promise<AdminListPage<UserTransaction>> {
  const params = new URLSearchParams({ page: String(page) });
  return apiFetch<AdminListPage<UserTransaction>>(
    `${USERS_PATH}/${usersId}/transactions?${params.toString()}`,
  );
}

export function getUserReferrals(usersId: number): Promise<UserReferrals> {
  return apiFetch<UserReferrals>(`${USERS_PATH}/${usersId}/referrals`);
}

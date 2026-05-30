/** Должен совпадать с ADMIN_USER_LIST_PAGE_SIZE на backend. */
export const USER_LIST_PAGE_SIZE = 50;

export function parseListPageParam(value: string | null): number {
  if (!value) {
    return 1;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

export function hasMoreListPages(itemCount: number): boolean {
  return itemCount >= USER_LIST_PAGE_SIZE;
}

export interface AdminListPage<T> {
  page: number;
  page_size: number;
  has_more: boolean;
  items: T[];
}

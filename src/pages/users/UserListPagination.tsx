import { Button } from '../../components/ui/Button/Button';
import styles from './UserProfilePage.module.css';

interface UserListPaginationProps {
  page: number;
  hasMore: boolean;
  loading: boolean;
  onPrev: () => void;
  onNext: () => void;
}

export function UserListPagination({
  page,
  hasMore,
  loading,
  onPrev,
  onNext,
}: UserListPaginationProps) {
  if (page <= 1 && !hasMore) {
    return null;
  }

  return (
    <div className={styles.pagination}>
      <Button type="button" variant="secondary" disabled={page <= 1 || loading} onClick={onPrev}>
        Назад
      </Button>
      <span className={styles.paginationLabel}>Страница {page}</span>
      <Button type="button" variant="secondary" disabled={!hasMore || loading} onClick={onNext}>
        Вперёд
      </Button>
    </div>
  );
}

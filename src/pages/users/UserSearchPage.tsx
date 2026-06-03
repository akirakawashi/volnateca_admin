import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { searchUsers } from '../../api/users';
import { Alert } from '../../components/ui/Alert/Alert';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { Field, Input } from '../../components/ui/Field/Field';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import type { UserSearchHit } from '../../types/user';
import { buildVkUserUrl } from '../../utils/prizeRedemption';
import styles from './UserSearchPage.module.css';

export function UserSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback(async (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const data = await searchUsers(trimmed);
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void runSearch(query);
  };

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Поддержка"
        title="Пользователь"
        subtitle="Поиск по VK ID, имени, screen name или коду заявки VLT-…"
      />

      <Card className={styles.searchCard}>
        <form className={styles.searchForm} onSubmit={handleSubmit}>
          <Field label="Поиск">
            <Input
              id="user-search-query"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="123456789, @screen, VLT-XXXX"
              autoComplete="off"
            />
          </Field>
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? 'Ищем…' : 'Найти'}
          </Button>
        </form>
      </Card>

      {error ? <Alert variant="error">{error}</Alert> : null}

      {searched && !loading && results.length === 0 ? (
        <Alert variant="info">Ничего не найдено. Уточните запрос.</Alert>
      ) : null}

      {results.length > 0 ? (
        <Card className={styles.resultsCard}>
          <ul className={styles.resultsList}>
            {results.map((user) => (
              <li key={user.users_id} className={styles.resultItem}>
                <div className={styles.resultMain}>
                  <span className={styles.resultName}>{user.display_name}</span>
                  <span className={styles.resultMeta}>
                    VK {user.vk_user_id}
                    {user.vk_screen_name ? ` · @${user.vk_screen_name}` : ''}
                  </span>
                </div>
                <div className={styles.resultAside}>
                  <span>{user.balance_points} ✦</span>
                  <span>ур. {user.current_level}</span>
                  <a
                    href={buildVkUserUrl(user.vk_user_id)}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.vkLink}
                  >
                    VK ↗
                  </a>
                  <Link to={`/users/${user.users_id}`} className={styles.profileBtn}>
                    Профиль
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}
    </div>
  );
}

import { useState } from 'react';
import type { FormEvent } from 'react';
import { Alert } from '../../components/ui/Alert/Alert';
import { Button } from '../../components/ui/Button/Button';
import { Field, Input } from '../../components/ui/Field/Field';
import styles from './LoginPage.module.css';

interface LoginPageProps {
  checking: boolean;
  onLogin: (login: string, password: string) => Promise<void>;
}

export function LoginPage({ checking, onLogin }: LoginPageProps) {
  const [login, setLogin] = useState('admin');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const disabled = checking || submitting;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await onLogin(login.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось выполнить вход');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <header className={styles.head}>
          <span className={styles.kicker}>Volnateca Admin</span>
          <h1 className={styles.title}>Вход</h1>
          <p className={styles.subtitle}>
            {checking ? 'Проверяем сессию…' : 'Логин и пароль администратора'}
          </p>
        </header>

        {error && <Alert variant="error">{error}</Alert>}

        <form className={styles.form} onSubmit={handleSubmit}>
          <Field label="Логин" required>
            <Input
              autoFocus
              autoComplete="username"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              disabled={disabled}
              placeholder="admin"
            />
          </Field>

          <Field label="Пароль" required>
            <div className={styles.passwordControl}>
              <Input
                className={styles.passwordInput}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={disabled}
                placeholder="Введите пароль"
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={() => setShowPassword((value) => !value)}
                disabled={disabled}
                aria-pressed={showPassword}
              >
                {showPassword ? 'Скрыть' : 'Показать'}
              </button>
            </div>
          </Field>

          <Button type="submit" size="md" loading={submitting} disabled={checking}>
            Войти
          </Button>
        </form>
      </section>
    </main>
  );
}

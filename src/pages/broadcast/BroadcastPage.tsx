import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useBroadcast } from '../../hooks/useBroadcast';
import { useAutoStatusMessage } from '../../hooks/useAutoStatusMessage';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import { Field, Textarea } from '../../components/ui/Field/Field';
import { Alert } from '../../components/ui/Alert/Alert';
import { FormFooter } from '../../components/ui/FormFooter/FormFooter';
import type { BroadcastStatus } from '../../types/broadcast';
import styles from './BroadcastPage.module.css';

const schema = z.object({
  message: z.string().trim().min(1, 'Текст сообщения обязателен').max(4096),
});

type FormValues = z.infer<typeof schema>;

const STATUS_LABELS: Record<BroadcastStatus, string> = {
  queued: 'В очереди',
  running: 'Отправляется',
  completed: 'Завершена',
  failed: 'Ошибка',
};

function formatProgressValue(value: number | null | undefined): string {
  if (value == null) return '—';
  return String(value);
}

export function BroadcastPage() {
  const { start, loading, error, snapshot, reset: resetMutation } = useBroadcast();
  const statusRef = useRef<HTMLDivElement>(null);
  const isActive = snapshot?.status === 'queued' || snapshot?.status === 'running';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { message: '' },
  });

  const onSubmit = async (values: FormValues) => {
    const created = await start(values.message);
    if (created) reset();
  };

  useAutoStatusMessage({
    active: Boolean(snapshot || error),
    scrollRef: statusRef,
    onDismiss: snapshot?.status === 'completed' || snapshot?.status === 'failed' ? resetMutation : undefined,
    dismissAfter: snapshot?.status === 'completed' || snapshot?.status === 'failed' ? 8000 : 0,
  });

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Broadcast"
        title="VK-рассылка"
        subtitle="Личные сообщения всем активным пользователям. Запуск асинхронный — статус обновляется автоматически."
      />

      {(snapshot || error) && (
        <div ref={statusRef} className={styles.statusRegion}>
          {error && <Alert variant="error">{error}</Alert>}

          {snapshot && (
            <Alert variant={snapshot.status === 'failed' ? 'error' : snapshot.status === 'completed' ? 'success' : 'info'}>
              <div className={styles.progressCard}>
                <div className={styles.statusBadge}>
                  {(snapshot.status === 'queued' || snapshot.status === 'running') && (
                    <span className={styles.statusDot} aria-hidden="true" />
                  )}
                  <span>{STATUS_LABELS[snapshot.status]}</span>
                  <span>· ID {snapshot.broadcast_id}</span>
                </div>

                <div className={styles.progressGrid}>
                  <div className={styles.progressItem}>
                    <span className={styles.progressLabel}>Получателей</span>
                    <strong className={styles.progressValue}>
                      {formatProgressValue(snapshot.target_total)}
                    </strong>
                  </div>
                  <div className={styles.progressItem}>
                    <span className={styles.progressLabel}>Обработано</span>
                    <strong className={styles.progressValue}>{snapshot.processed_total}</strong>
                  </div>
                  <div className={styles.progressItem}>
                    <span className={styles.progressLabel}>Отправлено</span>
                    <strong className={styles.progressValue}>{snapshot.sent_total}</strong>
                  </div>
                  <div className={styles.progressItem}>
                    <span className={styles.progressLabel}>Ошибок</span>
                    <strong className={styles.progressValue}>{snapshot.failed_total}</strong>
                  </div>
                </div>

                {snapshot.error && <p>{snapshot.error}</p>}
                <p className={styles.messagePreview}>{snapshot.message}</p>
              </div>
            </Alert>
          )}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
        onFocus={resetMutation}
        noValidate
        className={`formStack ${styles.form}`}
      >
        <Card title="Текст рассылки">
          <Field label="Сообщение" required error={errors.message?.message}>
            <Textarea
              {...register('message')}
              rows={8}
              placeholder="Текст личного сообщения во VK..."
              disabled={isActive}
            />
          </Field>
        </Card>

        <FormFooter>
          <Button type="submit" variant="primary" size="md" loading={loading} disabled={isActive}>
            {isActive ? 'Рассылка выполняется...' : 'Запустить рассылку'}
          </Button>
        </FormFooter>
      </form>
    </div>
  );
}

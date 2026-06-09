import { useEffect, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '../../components/ui/Alert/Alert';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { DateTimePicker } from '../../components/ui/DateTimePicker/DateTimePicker';
import { Field, Input, Textarea } from '../../components/ui/Field/Field';
import { FormFooter } from '../../components/ui/FormFooter/FormFooter';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import { useAutoStatusMessage } from '../../hooks/useAutoStatusMessage';
import { useTaskPromoCodeTask } from '../../hooks/useTaskPromoCodeTask';
import {
  defaultTaskPromoCodeFormValues,
  normalizePromoCode,
  taskPromoCodeEditFormSchema,
  taskPromoCodeFormSchema,
  type TaskPromoCodeEditFormValues,
  type TaskPromoCodeFormValues,
} from './schema';
import type { AdminTaskPromoCodeTask } from '../../types/taskPromoCode';
import styles from './TaskPromoCodeTaskPage.module.css';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDateTime(value: string | null): string {
  if (!value) return 'Не задано';
  return dateFormatter.format(new Date(value));
}

export function TaskPromoCodeTaskPage() {
  const {
    tasks,
    loading,
    creating,
    updating,
    error,
    successMessage,
    fetch,
    create,
    update,
    resetStatus,
  } = useTaskPromoCodeTask();
  const [editingTask, setEditingTask] = useState<AdminTaskPromoCodeTask | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const {
    control,
    register,
    handleSubmit,
    reset: resetCreateForm,
    formState: { errors: createErrors },
  } = useForm<TaskPromoCodeFormValues>({
    resolver: zodResolver(taskPromoCodeFormSchema),
    defaultValues: defaultTaskPromoCodeFormValues,
  });

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    formState: { errors: editErrors },
  } = useForm<TaskPromoCodeEditFormValues>({
    resolver: zodResolver(taskPromoCodeEditFormSchema),
    defaultValues: {
      description: '',
      image_attachment: '',
    },
  });

  useEffect(() => {
    void fetch();
  }, [fetch]);

  useEffect(() => {
    if (editingTask === null) {
      resetEditForm({ description: '', image_attachment: '' });
      return;
    }
    resetEditForm({
      description: editingTask.description ?? '',
      image_attachment: editingTask.image_attachment ?? '',
    });
  }, [editingTask, resetEditForm]);

  useAutoStatusMessage({
    active: Boolean(successMessage || error),
    scrollRef: statusRef,
    onDismiss: successMessage ? resetStatus : undefined,
  });

  const onSubmit = async (values: TaskPromoCodeFormValues) => {
    const created = await create({
      code: null,
      task_name: values.task_name.trim(),
      description: values.description?.trim() || null,
      points: values.points,
      week_number: values.week_number ?? null,
      starts_at: values.starts_at ? new Date(values.starts_at).toISOString() : null,
      ends_at: values.ends_at ? new Date(values.ends_at).toISOString() : null,
      promo_code: normalizePromoCode(values.promo_code),
      image_attachment: values.image_attachment?.trim() || null,
    });

    if (created) {
      resetCreateForm(defaultTaskPromoCodeFormValues);
    }
  };

  const onSubmitEdit = handleEditSubmit(async (values) => {
    if (editingTask === null) {
      return;
    }

    const updated = await update(editingTask.tasks_id, {
      description: values.description?.trim() || null,
      image_attachment: values.image_attachment?.trim() || null,
    });

    if (updated) {
      setEditingTask(null);
    }
  });

  const handleEditClick = (task: AdminTaskPromoCodeTask) => {
    if (!task.can_edit) {
      return;
    }
    resetStatus();
    setEditingTask(task);
  };

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Partner promo"
        title="Партнёрское задание"
        subtitle="Создание отдельного задания для каждого промокода партнёра"
      />

      {(successMessage || error) && (
        <div ref={statusRef} className={styles.statusRegion}>
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="error">{error}</Alert>}
        </div>
      )}

      <Card title="Создать задание" className={styles.formCard}>
        <form
          onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
          onFocus={resetStatus}
          noValidate
          className={`formStack ${styles.form}`}
        >
          <div className={styles.row2}>
            <Field label="Очки" required error={createErrors.points?.message}>
              <Input
                {...register('points', { valueAsNumber: true })}
                type="number"
                min={1}
                placeholder="15"
              />
            </Field>
            <Field label="Неделя (1–12)" error={createErrors.week_number?.message}>
              <Input
                {...register('week_number', {
                  setValueAs: (value: string) => (value === '' ? null : Number.parseInt(value, 10)),
                })}
                type="number"
                min={1}
                max={12}
                placeholder="Без недели"
              />
            </Field>
          </div>

          <Field label="Название задания" required error={createErrors.task_name?.message}>
            <Input {...register('task_name')} placeholder="Медоборы: промокод в соцсетях" />
          </Field>

          <Field label="Текст задания в боте">
            <Textarea
              {...register('description')}
              rows={6}
              placeholder="Загляни в соцсети партнёра, найди промокод и отправь его сюда."
            />
          </Field>

          <div className={styles.row2}>
            <Field label="Дата начала">
              <Controller
                control={control}
                name="starts_at"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </Field>
            <Field label="Дата окончания" error={createErrors.ends_at?.message}>
              <Controller
                control={control}
                name="ends_at"
                render={({ field }) => (
                  <DateTimePicker
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                )}
              />
            </Field>
          </div>

          <Field
            label="Промокод"
            required
            error={createErrors.promo_code?.message}
          >
            <Input {...register('promo_code')} placeholder="BOT-CODE-1" />
          </Field>

          <Field
            label="VK attachment изображения"
            hint="Вставьте VK attachment фото конкретного задания, например photo-123456_789. Показывается пользователю при старте задания."
            error={createErrors.image_attachment?.message}
          >
            <Input {...register('image_attachment')} placeholder="photo-123456_789" />
          </Field>

          <FormFooter inCard>
            <Button type="submit" variant="primary" size="md" loading={creating}>
              Создать задание
            </Button>
          </FormFooter>
        </form>
      </Card>

      {editingTask && (
        <Card
          title="Редактировать текст и картинку"
          className={styles.formCard}
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditingTask(null)}
            >
              Отменить
            </Button>
          }
        >
          <form onSubmit={onSubmitEdit} onFocus={resetStatus} noValidate className={`formStack ${styles.form}`}>
            <div className={styles.editMeta}>
              <strong>{editingTask.task_name}</strong>
              <span>Старт: {formatDateTime(editingTask.starts_at)}</span>
            </div>

            <Field label="Текст задания в боте">
              <Textarea
                {...registerEdit('description')}
                rows={6}
                placeholder="Текст, который пользователь увидит при старте задания."
              />
            </Field>

            <Field
              label="VK attachment изображения"
              hint="Например: photo-123456_789"
              error={editErrors.image_attachment?.message}
            >
              <Input {...registerEdit('image_attachment')} placeholder="photo-123456_789" />
            </Field>

            <FormFooter inCard>
              <Button type="submit" variant="primary" size="md" loading={updating}>
                Сохранить
              </Button>
            </FormFooter>
          </form>
        </Card>
      )}

      <Card title="Созданные партнёрские задания" className={styles.listCard}>
        {loading ? (
          <p className={styles.muted}>Загрузка заданий…</p>
        ) : !tasks || tasks.length === 0 ? (
          <p className={styles.muted}>Партнёрских заданий пока нет.</p>
        ) : (
          <ul className={styles.taskList}>
            {tasks.map((task) => (
              <li key={task.tasks_id} className={styles.taskItem}>
                <div className={styles.taskInfo}>
                  <div className={styles.taskTitleRow}>
                    <strong>{task.task_name}</strong>
                    <span className={task.can_edit ? styles.statusEditable : styles.statusLocked}>
                      {task.can_edit ? 'Можно редактировать' : 'Редактирование закрыто'}
                    </span>
                  </div>
                  <div className={styles.taskMeta}>
                    <span>Промокод: {task.promo_code}</span>
                    <span>Старт: {formatDateTime(task.starts_at)}</span>
                    <span>Картинка: {task.image_attachment ?? 'Не задана'}</span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={!task.can_edit}
                  onClick={() => handleEditClick(task)}
                >
                  Редактировать
                </Button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

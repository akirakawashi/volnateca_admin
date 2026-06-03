import { useRef } from 'react';
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
  taskPromoCodeFormSchema,
  type TaskPromoCodeFormValues,
} from './schema';
import styles from './TaskPromoCodeTaskPage.module.css';

export function TaskPromoCodeTaskPage() {
  const { creating, error, result, create, resetStatus } = useTaskPromoCodeTask();
  const statusRef = useRef<HTMLDivElement>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskPromoCodeFormValues>({
    resolver: zodResolver(taskPromoCodeFormSchema),
    defaultValues: defaultTaskPromoCodeFormValues,
  });

  useAutoStatusMessage({
    active: Boolean(result || error),
    scrollRef: statusRef,
    onDismiss: result ? resetStatus : undefined,
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
    });

    if (created) {
      reset(defaultTaskPromoCodeFormValues);
    }
  };

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Promo task"
        title="Задание Меняйки"
        subtitle="Создание одного задания с одним промокодом для проверки в боте"
      />

      {(result || error) && (
        <div ref={statusRef} className={styles.statusRegion}>
          {result && (
            <Alert variant="success">
              Задание <strong>{result.task_name}</strong> создано с промокодом{' '}
              <strong>{result.promo_code}</strong>
            </Alert>
          )}
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
            <Field label="Очки" required error={errors.points?.message}>
              <Input
                {...register('points', { valueAsNumber: true })}
                type="number"
                min={1}
                placeholder="15"
              />
            </Field>
            <Field label="Неделя (1–12)" error={errors.week_number?.message}>
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

          <Field label="Название задания" required error={errors.task_name?.message}>
            <Input {...register('task_name')} placeholder="Меняйка: обмен ГБ на промокод" />
          </Field>

          <Field label="Описание">
            <Textarea
              {...register('description')}
              rows={3}
              placeholder="Инструкция для внутренней админки или описания задания..."
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
            <Field label="Дата окончания" error={errors.ends_at?.message}>
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
            error={errors.promo_code?.message}
          >
            <Input {...register('promo_code')} placeholder="BOT-CODE-1" />
          </Field>

          <FormFooter inCard>
            <Button type="submit" variant="primary" size="md" loading={creating}>
              Создать задание
            </Button>
          </FormFooter>
        </form>
      </Card>
    </div>
  );
}

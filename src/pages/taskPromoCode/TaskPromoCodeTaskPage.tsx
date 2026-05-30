import { useMemo, useRef } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '../../components/ui/Alert/Alert';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { DateTimePicker } from '../../components/ui/DateTimePicker/DateTimePicker';
import { Field, Input, Select, Textarea } from '../../components/ui/Field/Field';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import { useAutoStatusMessage } from '../../hooks/useAutoStatusMessage';
import { useTaskPromoCodeTask } from '../../hooks/useTaskPromoCodeTask';
import type { TaskRepeatPolicy } from '../../types/taskPromoCode';
import {
  defaultTaskPromoCodeFormValues,
  parsePromoCodes,
  repeatPolicies,
  taskPromoCodeFormSchema,
  type TaskPromoCodeFormValues,
} from './schema';
import styles from './TaskPromoCodeTaskPage.module.css';

const repeatPolicyLabels: Record<TaskRepeatPolicy, string> = {
  once: 'Разово',
  daily: 'Ежедневно',
  weekly: 'Еженедельно',
};

const repeatPolicyOptions = repeatPolicies.map((policy) => ({
  value: policy,
  label: repeatPolicyLabels[policy],
}));

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

  const promoCodesText = useWatch({
    control,
    name: 'promo_codes_text',
  });
  const promoCodeCount = useMemo(() => parsePromoCodes(promoCodesText).length, [promoCodesText]);

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
      repeat_policy: values.repeat_policy,
      promo_codes: parsePromoCodes(values.promo_codes_text),
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
        subtitle="Создание задания и загрузка банка промокодов для проверки в боте"
        aside={
          <div className={styles.heroStats} aria-hidden="true">
            <div className={styles.metricCard}>
              <span>Кодов в форме</span>
              <strong>{promoCodeCount}</strong>
            </div>
          </div>
        }
      />

      {(result || error) && (
        <div ref={statusRef} className={styles.statusRegion}>
          {result && (
            <Alert variant="success">
              Задание <strong>{result.task_name}</strong> создано — загружено промокодов:{' '}
              {result.promo_codes_total}
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
          className={styles.form}
        >
          <div className={styles.row3}>
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
            <Field label="Повтор" required error={errors.repeat_policy?.message}>
              <Controller
                control={control}
                name="repeat_policy"
                render={({ field }) => (
                  <Select
                    name={field.name}
                    value={field.value}
                    onChange={(value) => field.onChange(value as TaskRepeatPolicy)}
                    onBlur={field.onBlur}
                    options={repeatPolicyOptions}
                  />
                )}
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
            label="Промокоды"
            required
            error={errors.promo_codes_text?.message}
            hint="Каждый код с новой строки. Также можно разделять запятой или точкой с запятой."
          >
            <Textarea
              {...register('promo_codes_text')}
              rows={12}
              placeholder={'BOT-CODE-001\nBOT-CODE-002\nBOT-CODE-003'}
            />
          </Field>

          <div className={styles.helperBox}>
            <strong>Текущее количество: {promoCodeCount}</strong>
            <span>
              Задание будет показываться пользователям, пока оно активно и у пользователя нет
              выполненного периода. Backend отключит задание после активации последнего кода.
            </span>
          </div>

          <div className={styles.formActions}>
            <Button type="submit" variant="primary" loading={creating}>
              Создать задание
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

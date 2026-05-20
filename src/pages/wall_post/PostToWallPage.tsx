import { useRef } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { usePostToWall } from '../../hooks/usePostToWall';
import { useAutoStatusMessage } from '../../hooks/useAutoStatusMessage';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import { Field, Input, Textarea } from '../../components/ui/Field/Field';
import { Alert } from '../../components/ui/Alert/Alert';
import { extractVkAttachment } from '../../utils/vkAttachments';
import styles from './PostToWallPage.module.css';

const schema = z.object({
  message: z.string().min(1, 'Текст поста обязателен').max(16384),
  like_points: z.number().int().positive('Должно быть > 0'),
  repost_points: z.number().int().positive('Должно быть > 0'),
  comment_points: z.number().int().min(0, 'Не может быть отрицательным'),
  week_number: z.number().int().min(1).max(12).nullable().optional(),
  attachments: z.array(z.object({ value: z.string().trim().min(1) })).max(10),
});

type FormValues = z.infer<typeof schema>;

export function PostToWallPage() {
  const { post, loading, error, result, reset: resetMutation } = usePostToWall();
  const statusRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as any,
    defaultValues: {
      message: '',
      like_points: 10,
      repost_points: 20,
      comment_points: 0,
      week_number: undefined,
      attachments: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'attachments' });

  const onSubmit = async (values: FormValues) => {
    const attachments = values.attachments
      .map(({ value }) => extractVkAttachment(value) ?? value.trim())
      .filter(Boolean);

    const posted = await post({
      message: values.message,
      like_points: values.like_points,
      repost_points: values.repost_points,
      comment_points: values.comment_points,
      week_number: values.week_number ?? null,
      attachments,
    });
    if (posted) reset();
  };

  useAutoStatusMessage({
    active: Boolean(result || error),
    scrollRef: statusRef,
    onDismiss: result ? resetMutation : undefined,
  });

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Wall post"
        title="Пост на стене"
        subtitle="Опубликовать запись от имени сообщества и создать задания"
      />

      {(result || error) && (
        <div ref={statusRef} className={styles.statusRegion}>
          {result && (
            <Alert variant="success">
              Пост опубликован — <strong>{result.external_id}</strong>
              {result.like_tasks_id != null && <>, задание «лайк»: #{result.like_tasks_id}</>}
              {result.repost_tasks_id != null && <>, «репост»: #{result.repost_tasks_id}</>}
              {result.comment_tasks_id != null && <>, «комментарий»: #{result.comment_tasks_id}</>}
            </Alert>
          )}
          {error && <Alert variant="error">{error}</Alert>}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
        onFocus={resetMutation}
        noValidate
        className={styles.form}
      >
        <Card title="Содержание поста">
          <Field label="Текст" required error={errors.message?.message}>
            <Textarea
              {...register('message')}
              rows={6}
              placeholder="Текст публикации..."
            />
          </Field>

          <div className={styles.mt}>
            <Field label="Вложения" hint="Можно вставить photo/doc/video/clip attachment или VK-фрагмент: система попробует извлечь нужную часть.">
              {fields.map((field, index) => (
                <div key={field.id} className={styles.attachRow}>
                  <Input
                    {...register(`attachments.${index}.value`)}
                    placeholder="photo-123456_789"
                  />
                  <button
                    type="button"
                    className={styles.removeAttach}
                    onClick={() => remove(index)}
                    aria-label="Удалить вложение"
                  >
                    ×
                  </button>
                </div>
              ))}
              {fields.length < 10 && (
                <button
                  type="button"
                  className={styles.addAttach}
                  onClick={() => append({ value: '' })}
                >
                  + Добавить вложение
                </button>
              )}
            </Field>
          </div>
        </Card>

        <Card title="Задания">
          <div className={styles.row3}>
            <Field label="Баллы за лайк" required error={errors.like_points?.message}>
              <Input
                {...register('like_points', { valueAsNumber: true })}
                type="number"
                min={1}
                placeholder="10"
              />
            </Field>
            <Field label="Баллы за репост" required error={errors.repost_points?.message}>
              <Input
                {...register('repost_points', { valueAsNumber: true })}
                type="number"
                min={1}
                placeholder="20"
              />
            </Field>
            <Field
              label="Баллы за комментарий"
              hint="0 — задание не создаётся"
              error={errors.comment_points?.message}
            >
              <Input
                {...register('comment_points', { valueAsNumber: true })}
                type="number"
                min={0}
                placeholder="0"
              />
            </Field>
          </div>
          <div className={styles.mt}>
            <Field label="Неделя (1–12)" hint="Оставьте пустым, если пост не привязан к неделе">
              <Input
                {...register('week_number', {
                  setValueAs: (v: string) => (v === '' ? null : parseInt(v, 10)),
                })}
                type="number"
                min={1}
                max={12}
                placeholder="—"
              />
            </Field>
          </div>
        </Card>

        <div className={styles.formActions}>
          <Button type="submit" variant="primary" loading={loading}>
            Опубликовать
          </Button>
        </div>
      </form>
    </div>
  );
}

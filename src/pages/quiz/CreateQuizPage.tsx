import { FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { quizFormSchema, defaultQuestion } from './schema';
import type { QuizFormValues } from './schema';
import { QuestionsEditor } from './QuestionsEditor';
import { useCreateQuiz } from '../../hooks/useCreateQuiz';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { Field, Input, Textarea } from '../../components/ui/Field/Field';
import { Alert } from '../../components/ui/Alert/Alert';
import { extractVkPhotoAttachment } from '../../utils/vkAttachments';
import styles from './CreateQuizPage.module.css';

export function CreateQuizPage() {
  const { create, loading, error, result, reset: resetMutation } = useCreateQuiz();

  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema) as any,
    defaultValues: {
      task_name: '',
      description: '',
      points: 15,
      week_number: undefined,
      starts_at: '',
      ends_at: '',
      questions: [defaultQuestion()],
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = methods;

  const onSubmit = async (values: QuizFormValues) => {
    const created = await create({
      task_name: values.task_name,
      description: values.description || null,
      points: values.points,
      week_number: values.week_number ?? null,
      starts_at: values.starts_at ? new Date(values.starts_at).toISOString() : null,
      ends_at: values.ends_at ? new Date(values.ends_at).toISOString() : null,
      questions: values.questions.map((q) => ({
        question_text: q.question_text,
        image_attachment: extractVkPhotoAttachment(q.image_attachment),
        options: q.options.map((o, i) => ({
          option_text: o.option_text,
          is_correct: o.is_correct,
          sort_order: i + 1,
        })),
      })),
    });
    if (created) {
      reset();
    }
  };

  return (
    <div className={styles.page}>

      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Создать квиз</h1>
        <p className={styles.pageSub}>Новое задание типа «Викторина»</p>
      </header>

      
      {result && (
        <Alert variant="success">
          Квиз <strong>{result.code}</strong> успешно создан — tasks_id: {result.tasks_id},{' '}
          вопросов: {result.questions.length}
        </Alert>
      )}
      {error && <Alert variant="error">{error}</Alert>}

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
          onFocus={resetMutation}
          noValidate
          className={styles.form}
        >
          <Card title="Основная информация">
            <div className={styles.row2}>
              <Field label="Очки" required error={errors.points?.message}>
                <Input
                  {...register('points', { valueAsNumber: true })}
                  type="number"
                  min={1}
                  placeholder="15"
                />
              </Field>
              <Field label="Неделя (1–12)">
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

            <div className={styles.mt}>
              <Field label="Название задания" required error={errors.task_name?.message}>
                <Input {...register('task_name')} placeholder="Викторина: история Волны" />
              </Field>
            </div>

            <div className={styles.mt}>
              <Field label="Описание">
                <Textarea
                  {...register('description')}
                  rows={2}
                  placeholder="Необязательное описание для пользователя..."
                />
              </Field>
            </div>

            <div className={[styles.row2, styles.mt].join(' ')}>
              <Field label="Дата начала">
                <Input {...register('starts_at')} type="datetime-local" />
              </Field>
              <Field label="Дата окончания" error={errors.ends_at?.message}>
                <Input {...register('ends_at')} type="datetime-local" />
              </Field>
            </div>
          </Card>

          <QuestionsEditor />

          <div className={styles.formActions}>
            <Button type="submit" variant="primary" loading={loading}>
              Создать квиз
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}

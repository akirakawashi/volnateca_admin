import { useEffect, useRef, useState } from 'react';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  defaultQuestion,
  quizFormSchema,
  quizQuestionImageEditSchema,
  type QuizFormValues,
  type QuizQuestionImageEditValues,
} from './schema';
import { QuestionsEditor } from './QuestionsEditor';
import { useCreateQuiz } from '../../hooks/useCreateQuiz';
import { useAutoStatusMessage } from '../../hooks/useAutoStatusMessage';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { DateTimePicker } from '../../components/ui/DateTimePicker/DateTimePicker';
import { PageHero } from '../../components/ui/PageHero/PageHero';
import { Field, Input, Textarea } from '../../components/ui/Field/Field';
import { Alert } from '../../components/ui/Alert/Alert';
import { FormFooter } from '../../components/ui/FormFooter/FormFooter';
import { extractVkPhotoAttachment } from '../../utils/vkAttachments';
import type { AdminQuiz, AdminQuizQuestionImage } from '../../types/quiz';
import styles from './CreateQuizPage.module.css';

const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDateTime(value: string | null): string {
  if (!value) return 'Не задано';
  return dateFormatter.format(new Date(value));
}

interface EditingQuestion {
  quiz: AdminQuiz;
  question: AdminQuizQuestionImage;
}

export function CreateQuizPage() {
  const {
    quizzes,
    fetch,
    quizzesLoading,
    create,
    loading,
    updating,
    error,
    result,
    successMessage,
    updateQuestionImage,
    resetStatus,
  } = useCreateQuiz();
  const [editingQuestion, setEditingQuestion] = useState<EditingQuestion | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  const methods = useForm<QuizFormValues>({
    resolver: zodResolver(quizFormSchema),
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

  const {
    register: registerImageEdit,
    handleSubmit: handleImageEditSubmit,
    reset: resetImageEditForm,
    formState: { errors: imageEditErrors },
  } = useForm<QuizQuestionImageEditValues>({
    resolver: zodResolver(quizQuestionImageEditSchema),
    defaultValues: {
      image_attachment: '',
    },
  });

  useEffect(() => {
    void fetch();
  }, [fetch]);

  useEffect(() => {
    if (editingQuestion === null) {
      resetImageEditForm({ image_attachment: '' });
      return;
    }
    resetImageEditForm({
      image_attachment: editingQuestion.question.image_attachment ?? '',
    });
  }, [editingQuestion, resetImageEditForm]);

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

  const onSubmitImageEdit = handleImageEditSubmit(async (values) => {
    if (editingQuestion === null) {
      return;
    }

    const updated = await updateQuestionImage(editingQuestion.question.quiz_questions_id, {
      image_attachment: extractVkPhotoAttachment(values.image_attachment || ''),
    });

    if (updated) {
      setEditingQuestion(null);
    }
  });

  const handleEditQuestionClick = (quiz: AdminQuiz, question: AdminQuizQuestionImage) => {
    if (!quiz.can_edit) {
      return;
    }
    resetStatus();
    setEditingQuestion({ quiz, question });
  };

  useAutoStatusMessage({
    active: Boolean(result || successMessage || error),
    scrollRef: statusRef,
    onDismiss: result || successMessage ? resetStatus : undefined,
  });

  return (
    <div className={styles.page}>
      <PageHero
        eyebrow="Quiz builder"
        title="Создать квиз"
        subtitle="Новое задание типа «Викторина»"
      />

      {(result || successMessage || error) && (
        <div ref={statusRef} className={styles.statusRegion}>
          {result && (
            <Alert variant="success">
              Квиз <strong>{result.code}</strong> успешно создан — tasks_id: {result.tasks_id},{' '}
              вопросов: {result.questions.length}
            </Alert>
          )}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}
          {error && <Alert variant="error">{error}</Alert>}
        </div>
      )}

      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
          onFocus={resetStatus}
          noValidate
          className={`formStack ${styles.form}`}
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
                <Controller
                  control={methods.control}
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
                  control={methods.control}
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
          </Card>

          <QuestionsEditor />

          <FormFooter>
            <Button type="submit" variant="primary" size="md" loading={loading}>
              Создать квиз
            </Button>
          </FormFooter>
        </form>
      </FormProvider>

      {editingQuestion && (
        <Card
          title="Редактировать фото вопроса"
          className={styles.formCard}
          action={
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setEditingQuestion(null)}
            >
              Отменить
            </Button>
          }
        >
          <form
            onSubmit={onSubmitImageEdit}
            onFocus={resetStatus}
            noValidate
            className={`formStack ${styles.form}`}
          >
            <div className={styles.editMeta}>
              <strong>{editingQuestion.quiz.task_name}</strong>
              <span>Старт: {formatDateTime(editingQuestion.quiz.starts_at)}</span>
            </div>

            <div className={styles.questionPreview}>
              {editingQuestion.question.question_text}
            </div>

            <Field
              label="VK attachment изображения"
              hint="Например: photo-123456_789. Пустое поле уберет фото у вопроса."
              error={imageEditErrors.image_attachment?.message}
            >
              <Input {...registerImageEdit('image_attachment')} placeholder="photo-123456_789" />
            </Field>

            <FormFooter inCard>
              <Button type="submit" variant="primary" size="md" loading={updating}>
                Сохранить
              </Button>
            </FormFooter>
          </form>
        </Card>
      )}

      <Card title="Фото вопросов квиза" className={styles.listCard}>
        {quizzesLoading ? (
          <p className={styles.muted}>Загрузка квизов…</p>
        ) : !quizzes || quizzes.length === 0 ? (
          <p className={styles.muted}>Квизов пока нет.</p>
        ) : (
          <ul className={styles.quizList}>
            {quizzes.map((quiz) => (
              <li key={quiz.tasks_id} className={styles.quizItem}>
                <div className={styles.quizHeader}>
                  <div className={styles.quizInfo}>
                    <div className={styles.quizTitleRow}>
                      <strong>{quiz.task_name}</strong>
                      <span
                        className={quiz.can_edit ? styles.statusEditable : styles.statusLocked}
                      >
                        {quiz.can_edit ? 'Можно редактировать' : 'Редактирование закрыто'}
                      </span>
                    </div>
                    <div className={styles.quizMeta}>
                      <span>Код: {quiz.code}</span>
                      <span>Старт: {formatDateTime(quiz.starts_at)}</span>
                      <span>Вопросов: {quiz.questions.length}</span>
                    </div>
                  </div>
                </div>

                {quiz.questions.length === 0 ? (
                  <p className={styles.muted}>Вопросов нет.</p>
                ) : (
                  <ul className={styles.questionList}>
                    {quiz.questions.map((question, index) => (
                      <li key={question.quiz_questions_id} className={styles.questionItem}>
                        <div className={styles.questionInfo}>
                          <strong>Вопрос {index + 1}</strong>
                          <p>{question.question_text}</p>
                          <span>Фото: {question.image_attachment ?? 'Не задано'}</span>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={!quiz.can_edit}
                          onClick={() => handleEditQuestionClick(quiz, question)}
                        >
                          Редактировать фото
                        </Button>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

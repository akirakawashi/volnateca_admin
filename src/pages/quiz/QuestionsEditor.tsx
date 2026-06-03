import { useFieldArray, useFormContext } from 'react-hook-form';
import type { QuizFormValues } from './schema';
import { defaultQuestion } from './schema';
import { OptionsEditor } from './OptionsEditor';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { Field, Input, Textarea } from '../../components/ui/Field/Field';
import styles from './QuestionsEditor.module.css';

export function QuestionsEditor() {
  const { register, control, formState: { errors } } = useFormContext<QuizFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

  return (
    <Card
      title="Вопросы"
      className={styles.questionsCard}
      action={
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => append(defaultQuestion())}
        >
          + Добавить вопрос
        </Button>
      }
    >
      {typeof errors.questions?.message === 'string' && (
        <p className={styles.globalError}>{errors.questions.message}</p>
      )}

      <div className={styles.questionsList}>
        {fields.map((field, qIdx) => (
          <article key={field.id} className={styles.questionBlock}>
            <header className={styles.questionHead}>
              <h4 className={styles.questionTitle}>Вопрос {qIdx + 1}</h4>
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={() => remove(qIdx)}
                >
                  Удалить
                </Button>
              )}
            </header>

            <div className={styles.questionBody}>
              <Field
                label="Текст вопроса"
                required
                error={errors.questions?.[qIdx]?.question_text?.message}
              >
                <Textarea
                  {...register(`questions.${qIdx}.question_text`)}
                  rows={3}
                  placeholder="Введите текст вопроса..."
                />
              </Field>

              <div className={styles.mt}>
                <Field
                  label="VK attachment изображения"
                  hint="Можно вставить photo-123456_789 или VK-фрагмент/ссылку: система попробует извлечь attachment."
                  error={errors.questions?.[qIdx]?.image_attachment?.message}
                >
                  <Input
                    {...register(`questions.${qIdx}.image_attachment`)}
                    placeholder="photo-123456_789"
                  />
                </Field>
              </div>

              <OptionsEditor questionIndex={qIdx} />
            </div>
          </article>
        ))}
      </div>
    </Card>
  );
}

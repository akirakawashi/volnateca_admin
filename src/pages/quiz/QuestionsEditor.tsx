import { useFieldArray, useFormContext } from 'react-hook-form';
import type { QuizFormValues } from './schema';
import { defaultQuestion } from './schema';
import { OptionsEditor } from './OptionsEditor';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Field, Input, Textarea } from '../../components/ui/Field';
import styles from './QuestionsEditor.module.css';

export function QuestionsEditor() {
  const { register, control, formState: { errors } } = useFormContext<QuizFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <h3 className={styles.title}>Вопросы</h3>
        {typeof errors.questions?.message === 'string' && (
          <span className={styles.error}>{errors.questions.message}</span>
        )}
        <Button type="button" variant="secondary" size="sm" onClick={() => append(defaultQuestion())}>
          + Добавить вопрос
        </Button>
      </div>

      {fields.map((field, qIdx) => (
        <Card
          key={field.id}
          title={`Вопрос ${qIdx + 1}`}
          action={
            fields.length > 1 ? (
              <Button type="button" variant="danger" size="sm" onClick={() => remove(qIdx)}>
                Удалить
              </Button>
            ) : undefined
          }
        >
          <div className={styles.questionInner}>
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

            <Field label="URL изображения">
              <Input
                {...register(`questions.${qIdx}.image_url`)}
                placeholder="https://example.com/image.png"
              />
            </Field>

            <OptionsEditor questionIndex={qIdx} />
          </div>
        </Card>
      ))}
    </div>
  );
}

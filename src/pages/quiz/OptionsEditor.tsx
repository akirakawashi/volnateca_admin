import { useFieldArray, useFormContext } from 'react-hook-form';
import type { QuizFormValues } from './schema';
import { Button } from '../../components/ui/Button/Button';
import { Input } from '../../components/ui/Field/Field';
import styles from './OptionsEditor.module.css';

interface OptionsEditorProps {
  questionIndex: number;
}

export function OptionsEditor({ questionIndex }: OptionsEditorProps) {
  const {
    register,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<QuizFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: `questions.${questionIndex}.options`,
  });

  const optionErrors = errors.questions?.[questionIndex]?.options;
  const rootMsg =
    (optionErrors as { root?: { message?: string } } | undefined)?.root?.message ??
    (typeof optionErrors?.message === 'string' ? optionErrors.message : undefined);

  const watchedOptions = watch(`questions.${questionIndex}.options`);

  const handleMarkCorrect = (optIdx: number) => {
    watchedOptions.forEach((_, i) => {
      setValue(`questions.${questionIndex}.options.${i}.is_correct`, i === optIdx, {
        shouldValidate: true,
      });
    });
  };

  return (
    <div className={styles.block}>
      <div className={styles.header}>
        <span className={styles.label}>Варианты ответов</span>
        {rootMsg && <span className={styles.error}>{rootMsg}</span>}
      </div>

      {fields.map((field, optIdx) => {
        const isCorrect = watchedOptions?.[optIdx]?.is_correct ?? false;
        const optErr = errors.questions?.[questionIndex]?.options?.[optIdx]?.option_text?.message;
        return (
          <div key={field.id} className={[styles.row, isCorrect ? styles.correct : ''].filter(Boolean).join(' ')}>
            <button
              type="button"
              className={[styles.correctBtn, isCorrect ? styles.correctBtnActive : ''].filter(Boolean).join(' ')}
              onClick={() => handleMarkCorrect(optIdx)}
              title="Отметить правильным"
            >
              {isCorrect ? '✓' : '○'}
            </button>
            <div className={styles.inputWrap}>
              <Input
                {...register(`questions.${questionIndex}.options.${optIdx}.option_text`)}
                placeholder={`Вариант ${optIdx + 1}`}
              />
              {optErr && <span className={styles.error}>{optErr}</span>}
            </div>
            {fields.length > 2 && (
              <Button type="button" variant="danger" size="sm" onClick={() => remove(optIdx)}>
                ✕
              </Button>
            )}
          </div>
        );
      })}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => append({ option_text: '', is_correct: false })}
      >
        + вариант
      </Button>
    </div>
  );
}

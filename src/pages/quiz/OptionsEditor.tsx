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
      <div className={styles.blockHead}>
        <span className={styles.blockLabel}>Варианты ответов</span>
        {rootMsg && <span className={styles.rootError}>{rootMsg}</span>}
      </div>

      <ul className={styles.optionList} role="list">
        {fields.map((field, optIdx) => {
          const isCorrect = watchedOptions?.[optIdx]?.is_correct ?? false;
          const optErr = errors.questions?.[questionIndex]?.options?.[optIdx]?.option_text?.message;
          return (
            <li
              key={field.id}
              className={[styles.optionRow, isCorrect ? styles.optionCorrect : ''].filter(Boolean).join(' ')}
            >
              <button
                type="button"
                className={[styles.correctMark, isCorrect ? styles.correctMarkOn : ''].filter(Boolean).join(' ')}
                onClick={() => handleMarkCorrect(optIdx)}
                title="Отметить правильным"
                aria-label={isCorrect ? 'Правильный ответ' : 'Отметить как правильный'}
              >
                {isCorrect ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                )}
              </button>
              <div className={styles.optionInputWrap}>
                <Input
                  {...register(`questions.${questionIndex}.options.${optIdx}.option_text`)}
                  placeholder={`Вариант ${optIdx + 1}`}
                />
                {optErr && <span className={styles.optErr}>{optErr}</span>}
              </div>
              {fields.length > 2 && (
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => remove(optIdx)}
                  aria-label="Удалить вариант"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </li>
          );
        })}
      </ul>

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

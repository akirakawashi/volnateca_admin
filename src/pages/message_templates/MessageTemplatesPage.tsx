import { useEffect, useState } from 'react';
import { useMessageTemplates } from '../../hooks/useMessageTemplates';
import { Button } from '../../components/ui/Button/Button';
import { Card } from '../../components/ui/Card/Card';
import { Field, Textarea } from '../../components/ui/Field/Field';
import { Alert } from '../../components/ui/Alert/Alert';
import styles from './MessageTemplatesPage.module.css';

export function MessageTemplatesPage() {
  const {
    templates,
    loading,
    savingCode,
    resettingCode,
    error,
    fetch,
    save,
    resetTemplate,
  } = useMessageTemplates();

  const [edits, setEdits] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch();
  }, [fetch]);

  const handleChange = (code: string, value: string) => {
    setEdits((prev) => ({ ...prev, [code]: value }));
  };

  const handleSave = async (code: string) => {
    const text = edits[code];
    if (text === undefined) return;
    const ok = await save(code, { template_text: text });
    if (ok) {
      setEdits((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
    }
  };

  const handleReset = async (code: string) => {
    const ok = await resetTemplate(code);
    if (ok) {
      setEdits((prev) => {
        const next = { ...prev };
        delete next[code];
        return next;
      });
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Шаблоны сообщений</h1>
        <p className={styles.pageSub}>Редактирование текстов сообщений, отправляемых ботом</p>
      </header>

      {error && <Alert variant="error">{error}</Alert>}

      {loading && templates === null && (
        <p className={styles.empty}>Загрузка…</p>
      )}

      {templates?.length === 0 && (
        <p className={styles.empty}>Нет доступных шаблонов</p>
      )}

      {templates?.map((t) => {
        const editedText = edits[t.code] ?? t.override_template ?? t.default_template;
        const hasChanges = edits[t.code] !== undefined;
        const isOverridden = t.override_template !== null;

        return (
          <Card key={t.code} title={t.description} className={styles.card}>
            <div className={styles.meta}>
              <span className={styles.code}>{t.code}</span>
              {t.variables.length > 0 && (
                <div className={styles.vars}>
                  <span className={styles.varLegend}>ПЕРЕМЕННЫЕ — например <span className={styles.varExample}>{"{user_name}"}</span></span>
                </div>
              )}
            </div>

            <div className={styles.mt}>
              <Field label="Текст шаблона">
                <Textarea
                  rows={5}
                  value={editedText}
                  onChange={(e) => handleChange(t.code, e.target.value)}
                  placeholder={t.default_template}
                />
              </Field>
            </div>

            <div className={styles.actions}>
              <Button
                variant="primary"
                loading={savingCode === t.code}
                onClick={() => handleSave(t.code)}
                disabled={!hasChanges && isOverridden}
              >
                {hasChanges ? 'Сохранить' : isOverridden ? 'Сохранено' : 'Сохранить'}
              </Button>
              <Button
                variant="secondary"
                loading={resettingCode === t.code}
                onClick={() => handleReset(t.code)}
                disabled={!isOverridden && !hasChanges}
              >
                Сбросить к дефолту
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

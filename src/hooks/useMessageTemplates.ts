import { useState, useCallback } from 'react';
import {
  listMessageTemplates,
  upsertMessageTemplate,
  deleteMessageTemplate,
} from '../api/message_template';
import type { MessageTemplate, UpsertMessageTemplatePayload } from '../types/message_template';

export function useMessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [resettingCode, setResettingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listMessageTemplates();
      setTemplates(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const save = useCallback(
    async (code: string, payload: UpsertMessageTemplatePayload): Promise<boolean> => {
      setSavingCode(code);
      setError(null);
      try {
        const updated = await upsertMessageTemplate(code, payload);
        setTemplates((prev) =>
          prev ? prev.map((t) => (t.code === code ? updated : t)) : null,
        );
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        return false;
      } finally {
        setSavingCode(null);
      }
    },
    [],
  );

  const resetTemplate = useCallback(async (code: string): Promise<boolean> => {
    setResettingCode(code);
    setError(null);
    try {
      await deleteMessageTemplate(code);
      setTemplates((prev) =>
        prev
          ? prev.map((t) =>
              t.code === code
                ? { ...t, override_template: null, effective_template: t.default_template }
                : t,
            )
          : null,
      );
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      return false;
    } finally {
      setResettingCode(null);
    }
  }, []);

  return {
    templates,
    loading,
    savingCode,
    resettingCode,
    error,
    fetch,
    save,
    resetTemplate,
  };
}

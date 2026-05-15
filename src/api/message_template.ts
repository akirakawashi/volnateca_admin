import { apiFetch } from './client';
import type { MessageTemplate, UpsertMessageTemplatePayload } from '../types/message_template';

export function listMessageTemplates(): Promise<MessageTemplate[]> {
  return apiFetch<MessageTemplate[]>('/v1/admin/message-templates');
}

export function upsertMessageTemplate(
  code: string,
  payload: UpsertMessageTemplatePayload,
): Promise<MessageTemplate> {
  return apiFetch<MessageTemplate>(`/v1/admin/message-templates/${encodeURIComponent(code)}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function deleteMessageTemplate(code: string): Promise<void> {
  return apiFetch<void>(`/v1/admin/message-templates/${encodeURIComponent(code)}`, {
    method: 'DELETE',
  });
}

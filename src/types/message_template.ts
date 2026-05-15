export interface MessageTemplate {
  code: string;
  description: string;
  variables: string[];
  default_template: string;
  override_template: string | null;
  effective_template: string;
}

export interface UpsertMessageTemplatePayload {
  template_text: string;
}

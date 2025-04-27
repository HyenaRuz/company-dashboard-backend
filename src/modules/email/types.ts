import { ETemplateName } from './enums/template-name.enum';

type TSendEmailPayload = {
  to: string;
  subject: string;
  template: ETemplateName;
  context?: Record<string, any>;
};

export type { TSendEmailPayload };

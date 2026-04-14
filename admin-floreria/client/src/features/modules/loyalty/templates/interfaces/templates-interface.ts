export type TemplateType = 'BIRTHDAY' | 'WINBACK' | 'SEASONAL' | 'GENERIC';

export interface EmailTemplate {
  id: string;
  name: string;
  type: TemplateType;
  subject: string;
  htmlContent: string;
  variables: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

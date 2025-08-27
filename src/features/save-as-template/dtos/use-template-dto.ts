export interface UseTemplateDTO {
  id: string;
  name: string;
  description: string;
  type: string;
  accessType: string;
  tags: string[];
  refId: string;
  createdBy?: string;
}

export interface KnowledgeBaseFileDto {
  id: string;
  fileName: string;
  fileSize: string;
  category?: string;
  createdBy: string;
  createdOn: Date | string;
}

export type VectorizationStatus = "Pending" | "Processing" | "Completed" | "Failed";

export interface KnowledgeBaseFileDto {
  id: string;
  fileName: string;
  fileSize: string;
  contentType?: string;
  chunksCount: number;
  status: VectorizationStatus;
  vectorizationErrorMessage?: string;
  category?: string;
  createdBy: string;
  createdOn: Date | string;
}

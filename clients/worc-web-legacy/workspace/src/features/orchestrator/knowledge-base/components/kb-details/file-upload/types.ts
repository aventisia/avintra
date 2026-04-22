import { KnowledgeBaseTableDto } from "../../../dtos/knowledge-base-table-dto";

// Tracks the lifecycle of a single file through the upload pipeline
export type FileUploadStatus =
  | "queued"
  | "registering"
  | "chunking"
  | "completed"
  | "failed";

export interface FileQueueItem {
  id: string;
  file: File;
  dataUri: string;
  status: FileUploadStatus;
  stageMessage: string;
  errorMessage?: string;
}

export interface KBAddFileFormProps {
  knowledgeBaseId: string;
  knowledgeBaseName: string;
  knowledgeBase?: KnowledgeBaseTableDto;
  onCompleted: () => void;
}

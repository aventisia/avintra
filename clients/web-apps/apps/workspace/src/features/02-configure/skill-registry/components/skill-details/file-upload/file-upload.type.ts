// Tracks the lifecycle of a single file through the upload pipeline
export type FileUploadStatus = "queued" | "registering" | "completed" | "failed";

export interface FileQueueItem {
  id: string;
  file: File;
  content: string;
  dataUri: string;
  status: FileUploadStatus;
  stageMessage: string;
  errorMessage?: string;
}

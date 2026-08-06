import type { FileUploadDto } from "@/components/file-uploader/apis/file-upload-apis";

// Tracks the lifecycle of a single file through the upload pipeline
export type FileUploadStatus = "queued" | "uploading" | "registering" | "completed" | "failed";

export interface FileQueueItem {
  id: string;
  file: File;
  status: FileUploadStatus;
  stageMessage: string;
  errorMessage?: string;
  progress: number;
  uploadedData?: FileUploadDto;
}

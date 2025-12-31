export interface FileInfo {
  id: string;
  name: string;
  size: number;
  type: string;
  path: string;
}

export type AllowedFileType = {
  category: string;
  extensions: string[];
  maxSizeMB: number;
};

export interface UploadProgress {
  uploadId: string;
  fileName: string;
  progress: number;
  status: "pending" | "uploading" | "completed" | "error";
  error?: string;
}

import {
  AlertCircleIcon,
  CheckCircleIcon,
  FileTextIcon,
  Loader2Icon,
} from "lucide-react";

import type { FileQueueItem, FileUploadStatus } from "./types";

/** Formats a byte count into a human-readable string (e.g. "1.5 MB") */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/** Filters out files already present in the queue (matched by name + size) */
export const deduplicateFiles = (
  existingFiles: FileQueueItem[],
  newFiles: File[],
): File[] => {
  const existingKeys = new Set(
    existingFiles.map((f) => `${f.file.name}__${f.file.size}`),
  );
  return newFiles.filter(
    (file) => !existingKeys.has(`${file.name}__${file.size}`),
  );
};

/** Reads a File object as a base64 data URI */
export const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

// -- Status display helpers --------------------------------------------------

const STATUS_COLORS: Record<FileUploadStatus, string> = {
  completed: "text-green-600",
  failed: "text-red-600",
  registering: "text-primary",
  chunking: "text-primary",
  queued: "text-gray-500",
};

export const getStatusColor = (status: FileUploadStatus): string =>
  STATUS_COLORS[status] ?? "text-gray-500";

const STATUS_ICONS: Record<FileUploadStatus, React.ReactNode> = {
  completed: <CheckCircleIcon className="h-4 w-4 text-green-600" />,
  failed: <AlertCircleIcon className="h-4 w-4 text-red-600" />,
  registering: (
    <Loader2Icon className="h-4 w-4 text-primary-500 animate-spin" />
  ),
  chunking: <Loader2Icon className="h-4 w-4 text-primary-500 animate-spin" />,
  queued: <FileTextIcon className="h-4 w-4 text-gray-400" />,
};

export const getStatusIcon = (status: FileUploadStatus): React.ReactNode =>
  STATUS_ICONS[status] ?? <FileTextIcon className="h-4 w-4 text-gray-400" />;

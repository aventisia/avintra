import {
  CheckCircleIcon,
  CircleNotchIcon,
  FileTextIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";

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
export const deduplicateFiles = (existingFiles: FileQueueItem[], newFiles: File[]): File[] => {
  const existingKeys = new Set(existingFiles.map((f) => `${f.file.name}__${f.file.size}`));
  return newFiles.filter((file) => !existingKeys.has(`${file.name}__${file.size}`));
};

// -- Status display helpers --------------------------------------------------

const STATUS_COLORS: Record<FileUploadStatus, string> = {
  completed: "text-ok",
  failed: "text-bad",
  registering: "text-live",
  uploading: "text-live",
  queued: "text-muted-foreground",
};

export const getStatusColor = (status: FileUploadStatus): string =>
  STATUS_COLORS[status] ?? "text-muted-foreground";

const STATUS_ICONS: Record<FileUploadStatus, React.ReactNode> = {
  completed: <CheckCircleIcon className="h-4 w-4 text-ok" />,
  failed: <WarningCircleIcon className="h-4 w-4 text-bad" />,
  registering: <CircleNotchIcon className="h-4 w-4 text-live animate-spin" />,
  uploading: <CircleNotchIcon className="h-4 w-4 text-live animate-spin" />,
  queued: <FileTextIcon className="h-4 w-4 text-muted-foreground" />,
};

export const getStatusIcon = (status: FileUploadStatus): React.ReactNode =>
  STATUS_ICONS[status] ?? <FileTextIcon className="h-4 w-4 text-muted-foreground" />;

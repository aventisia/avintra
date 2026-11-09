import {
  EyeIcon,
  FileDocIcon,
  FileImageIcon,
  FilePdfIcon,
  FilePptIcon,
  FileTextIcon,
  FileXlsIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { FC, MouseEvent } from "react";

import { TooltipIconButton } from "@/react-toolkit/features/av-platform-assistant-ui/components/tooltip-icon-button";

type WorkspaceChatFileCardProps = {
  artifactId: string;
  name?: string | null;
  contentType?: string | null;
  sizeBytes?: number | null;
  onPreview?: (artifactId: string) => void;
  onDelete?: (artifactId: string) => void;
};

const getWorkspaceChatCardFileExtension = (fileName: string) => {
  const dot = fileName.lastIndexOf(".");
  return dot < 0 ? "" : fileName.slice(dot + 1).toLowerCase();
};

const iconForWorkspaceChatFile = (contentType: string | null | undefined, fileName: string) => {
  const type = (contentType ?? "").toLowerCase();
  const extension = getWorkspaceChatCardFileExtension(fileName);

  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(extension))
    return FileImageIcon;
  if (type === "application/pdf" || extension === "pdf") return FilePdfIcon;
  if (type.includes("word") || ["doc", "docx"].includes(extension)) return FileDocIcon;
  if (
    type.includes("sheet") ||
    type.includes("excel") ||
    ["xls", "xlsx", "csv"].includes(extension)
  )
    return FileXlsIcon;
  if (
    type.includes("presentation") ||
    type.includes("powerpoint") ||
    ["ppt", "pptx"].includes(extension)
  )
    return FilePptIcon;
  return FileTextIcon;
};

const formatWorkspaceChatFileSize = (sizeBytes: number) => {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Card for a file the assistant generated; opens the stored artifact in the preview panel. */
export const WorkspaceChatFileCard: FC<WorkspaceChatFileCardProps> = ({
  artifactId,
  name,
  contentType,
  sizeBytes,
  onPreview,
  onDelete,
}) => {
  const label = name?.trim() ? name.trim() : "Stored file";
  const Icon = iconForWorkspaceChatFile(contentType, label);

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete?.(artifactId);
  };

  return (
    <div className="aui-workspace-chat-file-card group flex w-full max-w-sm items-center gap-1 rounded-xl border border-line bg-sunken/40 py-2.5 pl-3 pr-1.5 text-left transition-colors hover:bg-hover/60">
      <button
        type="button"
        onClick={() => onPreview?.(artifactId)}
        aria-label={`Preview ${label}`}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground ring-1 ring-line/60 group-hover:text-primary">
          <Icon className="size-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-ink">{label}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {sizeBytes != null ? formatWorkspaceChatFileSize(sizeBytes) : "Stored artifact"} ·
            Preview
          </span>
        </span>
        <EyeIcon className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
      </button>
      {onDelete && (
        <TooltipIconButton
          tooltip="Delete artifact"
          aria-label={`Delete ${label}`}
          onClick={handleDelete}
          className="shrink-0"
        >
          <TrashIcon className="size-4" />
        </TooltipIconButton>
      )}
    </div>
  );
};

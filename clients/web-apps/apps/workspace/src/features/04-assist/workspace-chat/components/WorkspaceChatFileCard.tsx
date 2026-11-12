import { CHAT_FILE_ICONS } from "@avplatform/chat";
import { Checkbox } from "@avplatform/ui";
import { buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { formatDate } from "@avplatform/ui/utils";
import {
  ChatCircleIcon,
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
import { Link } from "react-router-dom";

import { TooltipIconButton } from "@/react-toolkit/features/av-platform-assistant-ui/components/tooltip-icon-button";

type WorkspaceChatFileCardProps = {
  artifactId: string;
  name?: string | null;
  contentType?: string | null;
  sizeBytes?: number | null;
  createdOn?: string | null;
  conversationTitle?: string | null;
  /** 1-based version of the file; shown as a badge past the first version. */
  versionNumber?: number | null;
  /** Route of the chat that produced the file; without it no link is shown. */
  chatHref?: string;
  onPreview?: (artifactId: string) => void;
  onDelete?: (artifactId: string) => void;
  /** Shows a selection checkbox when set. */
  onSelectedChange?: (artifactId: string, selected: boolean) => void;
  selected?: boolean;
};

const getWorkspaceChatCardFileExtension = (fileName: string) => {
  const dot = fileName.lastIndexOf(".");
  return dot < 0 ? "" : fileName.slice(dot + 1).toLowerCase();
};

const iconForWorkspaceChatFile = (contentType: string | null | undefined, fileName: string) => {
  const type = (contentType ?? "").toLowerCase();
  const extension = getWorkspaceChatCardFileExtension(fileName);

  if (CHAT_FILE_ICONS[type]) return CHAT_FILE_ICONS[type];
  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "webp", "gif"].includes(extension))
    return FileImageIcon;
  if (type === "application/pdf" || extension === "pdf") return FilePdfIcon;
  if (type.includes("word") || ["doc", "docx"].includes(extension)) return FileDocIcon;
  if (type.includes("sheet") || type.includes("excel") || ["xls", "xlsx"].includes(extension))
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
  createdOn,
  conversationTitle,
  versionNumber,
  chatHref,
  onPreview,
  onDelete,
  onSelectedChange,
  selected = false,
}) => {
  const label = name?.trim() ? name.trim() : "Stored file";
  const Icon = iconForWorkspaceChatFile(contentType, label);
  const details = [
    sizeBytes != null ? formatWorkspaceChatFileSize(sizeBytes) : null,
    versionNumber != null && versionNumber > 1 ? `v${versionNumber}` : null,
    createdOn ? formatDate(createdOn) : null,
    conversationTitle?.trim() || null,
  ].filter(Boolean);

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete?.(artifactId);
  };

  return (
    <div
      className={cn(
        "aui-workspace-chat-file-card group flex w-full max-w-sm items-center gap-1 rounded-xl border border-line bg-sunken/40 py-2.5 pl-3 pr-1.5 text-left transition-colors hover:bg-hover/60",
        selected && "border-indicator bg-hover/60",
      )}
    >
      {onSelectedChange && (
        <Checkbox
          checked={selected}
          onCheckedChange={(checked) => onSelectedChange(artifactId, checked === true)}
          aria-label={`Select ${label}`}
          className="mr-2"
        />
      )}
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
            {details.length ? details.join(" · ") : "Stored artifact"}
          </span>
        </span>
        <EyeIcon className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
      </button>
      {chatHref && (
        <Tooltip
          content={conversationTitle ? `Open “${conversationTitle}”` : "Open chat"}
          side="bottom"
        >
          <Link
            to={chatHref}
            aria-label={`Open the chat that made ${label}`}
            className={buttonVariants({ variant: "ghost", size: "icon6", className: "p-1" })}
          >
            <ChatCircleIcon className="size-4" />
          </Link>
        </Tooltip>
      )}
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

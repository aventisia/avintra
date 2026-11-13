import { CHAT_FILE_ICONS } from "@avplatform/chat";
import { Checkbox } from "@avplatform/ui";
import { cn } from "@avplatform/ui/lib";
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
  LinkBreakIcon,
  LinkSimpleIcon,
  TrashIcon,
} from "@phosphor-icons/react";
import type { FC, MouseEvent } from "react";
import { Link } from "react-router-dom";

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
  /** Copies the read-only share link; without it no share button is shown. */
  onCopyShareLink?: (artifactId: string) => void;
  /** Stops sharing; without it no stop-sharing button is shown. */
  onStopSharing?: (artifactId: string) => void;
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

const actionClassName =
  "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus";

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
  onCopyShareLink,
  onStopSharing,
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

  const hasActions = Boolean(chatHref || onCopyShareLink || onStopSharing || onDelete);

  const handleDelete = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete?.(artifactId);
  };

  const handleShare = (event: MouseEvent<HTMLButtonElement>, action: (id: string) => void) => {
    event.stopPropagation();
    action(artifactId);
  };

  return (
    <div
      className={cn(
        "aui-workspace-chat-file-card group flex w-full max-w-sm flex-col gap-2 rounded-xl border border-line bg-sunken/40 p-3 text-left transition-colors hover:bg-hover/60",
        selected && "border-indicator bg-hover/60",
      )}
    >
      <div className="flex items-start gap-2">
        {onSelectedChange && (
          <Checkbox
            checked={selected}
            onCheckedChange={(checked) => onSelectedChange(artifactId, checked === true)}
            aria-label={`Select ${label}`}
            className="mt-2.5"
          />
        )}
        <button
          type="button"
          onClick={() => onPreview?.(artifactId)}
          aria-label={`Preview ${label}`}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-muted-foreground ring-1 ring-line/60 group-hover:text-primary">
            <Icon className="size-5" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="line-clamp-2 break-words text-sm font-medium leading-5 text-ink">
              {label}
            </span>
            <span className="mt-0.5 line-clamp-2 break-words text-xs text-muted-foreground">
              {details.length ? details.join(" · ") : "Stored artifact"}
            </span>
          </span>
          <EyeIcon className="mt-1 size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
        </button>
      </div>
      {hasActions && (
        <div className="flex flex-wrap items-center gap-1 border-t border-line/60 pt-2">
          {chatHref && (
            <Link
              to={chatHref}
              title={conversationTitle ? `Open “${conversationTitle}”` : "Open chat"}
              aria-label={`Open the chat that made ${label}`}
              className={actionClassName}
            >
              <ChatCircleIcon className="size-4" />
              Open chat
            </Link>
          )}
          {onCopyShareLink && (
            <button
              type="button"
              title="Copy read-only link"
              aria-label={`Copy read-only link for ${label}`}
              onClick={(event) => handleShare(event, onCopyShareLink)}
              className={actionClassName}
            >
              <LinkSimpleIcon className="size-4" />
              Share link
            </button>
          )}
          {onStopSharing && (
            <button
              type="button"
              title="Stop sharing"
              aria-label={`Stop sharing ${label}`}
              onClick={(event) => handleShare(event, onStopSharing)}
              className={actionClassName}
            >
              <LinkBreakIcon className="size-4" />
              Stop sharing
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              title="Delete artifact"
              aria-label={`Delete ${label}`}
              onClick={handleDelete}
              className={cn(actionClassName, "ml-auto hover:text-bad")}
            >
              <TrashIcon className="size-4" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
};

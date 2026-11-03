import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { TrashIcon } from "@phosphor-icons/react";

import type { FileQueueItem } from "./types";
import { formatFileSize, getStatusColor, getStatusIcon } from "./utils";

interface FileQueueListProps {
  files: FileQueueItem[];
  activeFileId: string | null;
  isPending: boolean;
  onRemove: (id: string) => void;
  onDeleteOrphan: (fileItem: FileQueueItem) => void;
}

/** Renders the list of queued/in-progress/completed files */
export const FileQueueList = ({
  files,
  activeFileId,
  isPending,
  onRemove,
  onDeleteOrphan,
}: FileQueueListProps) => {
  if (files.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-sm ml-1 font-medium text-ink-2">Files ({files.length})</h4>
      <div className="flex flex-col gap-2">
        {files.map((fileItem) => (
          <FileQueueRow
            key={fileItem.id}
            fileItem={fileItem}
            isActive={fileItem.id === activeFileId}
            isPending={isPending}
            onRemove={onRemove}
            onDeleteOrphan={onDeleteOrphan}
          />
        ))}
      </div>
    </div>
  );
};

// -- Individual file row -----------------------------------------------------

interface FileQueueRowProps {
  fileItem: FileQueueItem;
  isActive: boolean;
  isPending: boolean;
  onRemove: (id: string) => void;
  onDeleteOrphan: (fileItem: FileQueueItem) => void;
}

const FileQueueRow = ({
  fileItem,
  isActive,
  isPending,
  onRemove,
  onDeleteOrphan,
}: FileQueueRowProps) => {
  const isInFlight = fileItem.status === "uploading" || fileItem.status === "registering";
  const isOrphan = fileItem.status === "failed" && !!fileItem.uploadedData;

  return (
    <div
      className={`flex items-center justify-between rounded-lg p-2 px-2.5 ${
        isActive ? "bg-selected border border-primary/35" : "bg-muted"
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Status icon */}
        <div className="bg-surface rounded-md flex items-center justify-center size-9 border border-line">
          {getStatusIcon(fileItem.status)}
        </div>

        {/* File/Document name & status */}
        <div className="flex flex-col flex-1">
          <p className="text-xs font-medium truncate max-w-[80%]">{fileItem.file.name}</p>
          <div className="flex items-center gap-2">
            <p className={`text-2xs font-medium ${getStatusColor(fileItem.status)}`}>
              {fileItem.stageMessage}
            </p>
            {fileItem.status === "failed" && (
              <p className="text-2xs text-bad">({fileItem.errorMessage})</p>
            )}
            {fileItem.status === "queued" && (
              <p className="font-mono text-2xs tabular-nums text-muted-foreground">
                {formatFileSize(fileItem.file.size)}
              </p>
            )}
          </div>

          {/* Upload progress bar */}
          {fileItem.status === "uploading" && (
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-fill">
              <div
                className="h-full rounded-full bg-live transition-all duration-200"
                style={{ width: `${fileItem.progress}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Action buttons */}
      {isOrphan ? (
        <Button
          type="button"
          onClick={() => onDeleteOrphan(fileItem)}
          variant="caution"
          size="icon7"
          className="flex"
          disabled={isPending}
          aria-label="Delete uploaded file"
          title="Delete uploaded file (not saved to ticket)"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      ) : (
        <Button
          type="button"
          onClick={() => onRemove(fileItem.id)}
          variant="caution"
          size="icon7"
          className={cn(isInFlight || isPending ? "hidden" : "flex")}
          disabled={isInFlight || isPending}
          aria-label="Remove file"
        >
          <TrashIcon className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};

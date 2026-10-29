import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { XIcon } from "lucide-react";

import type { FileQueueItem } from "./file-upload.type";
import { formatFileSize, getStatusColor, getStatusIcon } from "./file-upload.util";

interface FileQueueListProps {
  files: FileQueueItem[];
  activeFileId: string | null;
  isPending: boolean;
  onRemove: (id: string) => void;
}

/** Renders the list of queued/in-progress/completed files */
export const FileQueueList = ({ files, activeFileId, isPending, onRemove }: FileQueueListProps) => {
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
}

const FileQueueRow = ({ fileItem, isActive, isPending, onRemove }: FileQueueRowProps) => {
  const isInFlight = fileItem.status === "registering";

  return (
    <div
      className={`flex items-center justify-between rounded-xl p-2 px-2.5 ${
        isActive ? "bg-selected border border-line" : "bg-muted"
      }`}
    >
      <div className="flex items-center gap-3 flex-1">
        {/* Status icon */}
        <div className="bg-surface rounded-full flex items-center justify-center size-9 border border-line">
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
              <p className="text-2xs text-muted-foreground">{formatFileSize(fileItem.file.size)}</p>
            )}
          </div>
        </div>
      </div>

      {/* Remove button — hidden while uploading */}
      <Button
        type="button"
        onClick={() => onRemove(fileItem.id)}
        variant="caution"
        size="icon7"
        className={cn(isInFlight || isPending ? "hidden" : "flex")}
        disabled={isInFlight || isPending}
        aria-label="Remove file"
      >
        <XIcon className="h-4 w-4" />
      </Button>
    </div>
  );
};

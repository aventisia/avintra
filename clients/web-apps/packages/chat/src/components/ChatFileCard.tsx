import { cn } from "@avplatform/ui/lib";
import {
  ArrowRightIcon,
  CircleNotchIcon,
  FileCodeIcon,
  FileCsvIcon,
  FileImageIcon,
  FileTextIcon,
} from "@phosphor-icons/react";

import { formatFileSize } from "../utils/chat-file.util";

const iconFor = (contentType: string) => {
  if (contentType === "text/html") return FileCodeIcon;
  if (contentType.startsWith("image/")) return FileImageIcon;
  if (contentType === "text/csv" || contentType === "text/tab-separated-values") return FileCsvIcon;
  return FileTextIcon;
};

const describeType = (contentType: string) =>
  ({
    "text/html": "Interface",
    "image/svg+xml": "Image",
    "text/csv": "Spreadsheet",
    "text/tab-separated-values": "Spreadsheet",
    "text/markdown": "Document",
  })[contentType] ?? "File";

type ChatFileCardProps = {
  name: string;
  contentType: string;
  sizeBytes?: number;
  /** Opens the stored file; without it the card shows progress. */
  onOpen?: () => void;
  /** Shown while the file streams or saves. */
  progress?: string;
};

/** A file the assistant made: a progress line while it streams or saves, then a button that opens it. */
export const ChatFileCard = ({
  name,
  contentType,
  sizeBytes,
  onOpen,
  progress,
}: ChatFileCardProps) => {
  const Icon = iconFor(contentType);
  const meta = [
    describeType(contentType),
    sizeBytes === undefined ? null : formatFileSize(sizeBytes),
  ]
    .filter(Boolean)
    .join(" · ");
  const body = (
    <>
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="size-5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[0.9375rem] font-medium leading-6 text-ink">
          {name}
        </span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {onOpen ? (
            meta
          ) : (
            <>
              <CircleNotchIcon className="size-3 animate-spin text-primary motion-reduce:animate-none" />
              {progress}
            </>
          )}
        </span>
      </span>
    </>
  );
  const className =
    "my-3 flex w-full items-center gap-3.5 rounded-2xl border border-line bg-surface px-4 py-3 text-left shadow-[0_1px_2px_rgb(0_0_0/0.04),0_8px_24px_-16px_rgb(0_0_0/0.2)] duration-200 animate-in fade-in-0 motion-reduce:animate-none dark:bg-fill/40";

  if (!onOpen)
    return (
      <div role="status" className={className}>
        {body}
      </div>
    );

  return (
    <button
      type="button"
      aria-label={`Open ${name}`}
      onClick={onOpen}
      className={cn(
        className,
        "group/file transition-colors hover:border-line-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus",
      )}
    >
      {body}
      <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-ink-2 transition-colors group-hover/file:text-ink">
        Open
        <ArrowRightIcon
          weight="bold"
          className="size-3.5 transition-transform group-hover/file:translate-x-0.5 motion-reduce:transition-none"
        />
      </span>
    </button>
  );
};

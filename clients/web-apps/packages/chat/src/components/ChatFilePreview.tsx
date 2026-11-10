import { Skeleton } from "@avplatform/ui";
import { ArrowSquareOutIcon, DownloadSimpleIcon, XIcon } from "@phosphor-icons/react";

import { formatFileSize } from "../utils/chat-file.util";
import { ChatIconButton } from "./ChatIconButton";

export type ChatPreviewFile = {
  name: string;
  contentType: string;
  sizeBytes: number;
  /** A URL the browser can load, such as a data: URL; null when the file can't be shown. */
  url: string | null;
};

type ChatFilePreviewProps = {
  file: ChatPreviewFile | null;
  isLoading: boolean;
  onClose: () => void;
};

const linkClassName =
  "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-hover hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus [&_svg]:size-4";

/** A generated file beside the thread: rendered in a sandbox, with download, open in a new tab and close. */
export const ChatFilePreview = ({ file, isLoading, onClose }: ChatFilePreviewProps) => (
  <section
    aria-label={file ? `Preview of ${file.name}` : "File preview"}
    className="flex h-full min-h-0 flex-col bg-surface dark:bg-bg"
  >
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-line pl-4 pr-2">
      <div className="min-w-0 flex-1">
        <h2 className="truncate text-sm font-medium text-ink">{file?.name ?? "Loading file…"}</h2>
      </div>
      {file && (
        <span className="shrink-0 text-xs text-muted-foreground">
          {formatFileSize(file.sizeBytes)}
        </span>
      )}
      {file?.url && (
        <>
          <a
            href={file.url}
            download={file.name}
            aria-label={`Download ${file.name}`}
            title="Download"
            className={linkClassName}
          >
            <DownloadSimpleIcon />
          </a>
          <a
            href={file.url}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${file.name} in a new tab`}
            title="Open in new tab"
            className={linkClassName}
          >
            <ArrowSquareOutIcon />
          </a>
        </>
      )}
      <ChatIconButton label="Close preview" onClick={onClose}>
        <XIcon />
      </ChatIconButton>
    </header>
    <div className="min-h-0 flex-1">
      {isLoading ? (
        <div role="status" aria-label="Loading preview" className="space-y-3 p-6">
          <Skeleton className="h-6 w-1/2 rounded" />
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      ) : file?.url ? (
        file.contentType.startsWith("image/") ? (
          <div className="flex h-full items-center justify-center overflow-auto p-6">
            <img src={file.url} alt={file.name} className="max-h-full max-w-full" />
          </div>
        ) : (
          // IMPORTANT NOTE: generated HTML is untrusted; the sandbox lets its scripts run without same-origin access.
          <iframe
            src={file.url}
            title={file.name}
            sandbox="allow-scripts"
            className="size-full border-0 bg-white"
          />
        )
      ) : (
        <p className="p-6 text-sm text-muted-foreground">
          This file can't be previewed. Try opening it from Artifacts.
        </p>
      )}
    </div>
  </section>
);

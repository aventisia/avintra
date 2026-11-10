import {
  ArrowSquareOutIcon,
  DownloadSimpleIcon,
  FileDocIcon,
  FileImageIcon,
  FilePdfIcon,
  FilePptIcon,
  FileTextIcon,
  FileXlsIcon,
  XIcon,
} from "@phosphor-icons/react";
import { type FC, useEffect, useState } from "react";

import { TooltipIconButton } from "@/react-toolkit/features/av-platform-assistant-ui/components/tooltip-icon-button";

import { getChatArtifact } from "../apis/workspace-chat.apis";

type WorkspaceChatPreviewPanelProps = {
  artifactId: string;
  onClose: () => void;
};

type WorkspaceChatPreviewFile = {
  id: string;
  name: string;
  contentType: string;
  sizeBytes: number;
  blobPath: string;
  origin: string;
};

const OFFICE_WORKSPACE_CHAT_MIME_TYPES = [
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const OFFICE_WORKSPACE_CHAT_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];

const getWorkspaceChatPreviewExtension = (fileName: string) => {
  const dot = fileName.lastIndexOf(".");
  return dot < 0 ? "" : fileName.slice(dot + 1).toLowerCase();
};

const isOfficeWorkspaceChatPreview = (contentType: string, fileName: string) =>
  OFFICE_WORKSPACE_CHAT_MIME_TYPES.includes(contentType.toLowerCase()) ||
  OFFICE_WORKSPACE_CHAT_EXTENSIONS.includes(getWorkspaceChatPreviewExtension(fileName));

const canPreviewWorkspaceChatFileInline = (contentType: string) => {
  const type = contentType.toLowerCase();
  return (
    type.startsWith("image/") ||
    type === "application/pdf" ||
    type === "application/json" ||
    type === "application/xml" ||
    type === "text/html" ||
    type.startsWith("text/")
  );
};

const iconForWorkspaceChatPreview = (contentType: string, fileName: string) => {
  const type = contentType.toLowerCase();
  const extension = getWorkspaceChatPreviewExtension(fileName);

  if (type.startsWith("image/") || type === "application/pdf") {
    if (type === "application/pdf" || extension === "pdf") return FilePdfIcon;
    return FileImageIcon;
  }
  if (
    OFFICE_WORKSPACE_CHAT_MIME_TYPES.includes(type) ||
    OFFICE_WORKSPACE_CHAT_EXTENSIONS.includes(extension)
  ) {
    if (type.includes("word") || ["doc", "docx"].includes(extension)) return FileDocIcon;
    if (type.includes("sheet") || type.includes("excel") || ["xls", "xlsx"].includes(extension))
      return FileXlsIcon;
    return FilePptIcon;
  }
  return FileTextIcon;
};

const formatWorkspaceChatPreviewSize = (sizeBytes: number) => {
  if (sizeBytes < 1024) return `${sizeBytes} B`;
  if (sizeBytes < 1024 * 1024) return `${(sizeBytes / 1024).toFixed(1)} KB`;
  return `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`;
};

/** Right-side preview for a generated file; Office files show a summary instead of a broken panel. */
export const WorkspaceChatPreviewPanel: FC<WorkspaceChatPreviewPanelProps> = ({
  artifactId,
  onClose,
}) => {
  const [file, setFile] = useState<WorkspaceChatPreviewFile | null>(null);

  useEffect(() => {
    let live = true;
    setFile(null);
    getChatArtifact(artifactId)
      .then((response) => {
        if (!live || !response.data) return;
        const artifact = response.data;
        setFile({
          id: artifact.id,
          name: artifact.name,
          contentType: artifact.contentType,
          sizeBytes: artifact.sizeBytes,
          blobPath: artifact.blobPath,
          origin: artifact.origin,
        });
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [artifactId]);

  const blobUrl = file?.blobPath.startsWith("data:") ? file.blobPath : null;

  const name = file?.name ?? (artifactId ? `File ${artifactId.slice(0, 8)}` : "Stored file");
  const contentType = file?.contentType ?? "";
  const Icon = file ? iconForWorkspaceChatPreview(contentType, file.name) : FileTextIcon;
  const showOfficeSummary =
    file != null &&
    (!canPreviewWorkspaceChatFileInline(contentType) ||
      isOfficeWorkspaceChatPreview(contentType, file.name));

  return (
    <div className="aui-workspace-chat-preview flex h-full min-h-0 flex-col bg-surface">
      <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{name}</span>
        {file && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatWorkspaceChatPreviewSize(file.sizeBytes)}
          </span>
        )}
        <TooltipIconButton tooltip="Close preview" aria-label="Close preview" onClick={onClose}>
          <XIcon className="size-4" />
        </TooltipIconButton>
      </div>
      <div className="min-h-0 flex-1 overflow-auto">
        {!file ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
            <p className="text-sm font-medium text-ink">
              Preview isn&apos;t available for this file.
            </p>
            <p className="text-xs text-muted-foreground">
              Open it from the file card once it loads.
            </p>
          </div>
        ) : showOfficeSummary ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-sunken text-muted-foreground ring-1 ring-line/60">
              <Icon className="size-7" />
            </span>
            <p className="max-w-full truncate text-sm font-medium text-ink">{file.name}</p>
            <p className="text-xs text-muted-foreground">
              {file.origin} · {file.contentType} · {formatWorkspaceChatPreviewSize(file.sizeBytes)}
            </p>
            {blobUrl && (
              <div className="mt-1 flex items-center gap-2">
                <a
                  href={blobUrl}
                  download={file.name}
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-medium text-ink shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <DownloadSimpleIcon className="size-3.5" />
                  Download
                </a>
                <a
                  href={blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line bg-surface px-3 text-xs font-medium text-ink shadow-sm transition-colors hover:border-primary/40 hover:text-primary"
                >
                  <ArrowSquareOutIcon className="size-3.5" />
                  Open
                </a>
              </div>
            )}
          </div>
        ) : blobUrl ? (
          <iframe
            src={blobUrl}
            title={file.name}
            sandbox="allow-scripts"
            className="h-full w-full border-0 bg-white"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 p-6 text-center">
            <p className="text-sm font-medium text-ink">
              Preview isn&apos;t available for this file.
            </p>
            <p className="text-xs text-muted-foreground">Download it from the file card instead.</p>
          </div>
        )}
      </div>
    </div>
  );
};

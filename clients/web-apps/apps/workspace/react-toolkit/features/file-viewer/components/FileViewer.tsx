import { LoadingSpinner, NoContentMessage } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";
import { useQuery } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { AlertTriangleIcon, FileWarningIcon } from "lucide-react";
import { type ComponentType, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import {
  type RemoteFileLoader,
  type RemoteFileLoaderResult,
  defaultRemoteFileLoader,
} from "../services/remote-file-loader";
import { type LocalFile, useLocalFileStore } from "../stores/file-list-store";
import { useViewerStore } from "../stores/file-viewer-store";
import { usePdfViewerStore } from "../stores/pdf-previewer-store";
import { FILE_TYPE, FileType, getFileType } from "../types/file-viewer-types";
import DocxViewer from "./docx-viewer/DocxViewer";
import EmlViewer from "./eml-viewer/EmlViewer";
import UnsupportedViewer from "./UnsupportedViewer";
import FileViewerHeader from "./file-viewer-header/FileViewerHeader";
import PageControl from "./file-viewer-header/PageControl";
import ImageControlPanel from "./image-viewer/ImageControlPanel";
import ImageViewer from "./image-viewer/ImageViewer";
import PdfControlPanel from "./pdf-viewer/PdfControlPanel";
import PdfViewer from "./pdf-viewer/PdfViewer";
import XlsxViewer from "./xlsx-viewer/XlsxViewer";

// Registry
//
// To add a new file type (e.g. DOCX, XLSX):
//   1. Add the extension to `utils/file-types.ts`
//   2. Create a viewer component and a control panel component
//   3. Register them here

interface ViewerRegistryEntry {
  Viewer: ComponentType<{ fileUrl: string }>;
  ControlPanel: ComponentType | null;
  PageControl?: ComponentType | null;
}

const VIEWER_REGISTRY: Record<FileType, ViewerRegistryEntry> = {
  [FILE_TYPE.PDF]: {
    Viewer: PdfViewer,
    ControlPanel: PdfControlPanel,
    PageControl: PageControl,
  },
  [FILE_TYPE.IMAGE]: {
    Viewer: ImageViewer,
    ControlPanel: ImageControlPanel,
  },
  [FILE_TYPE.DOCX]: {
    Viewer: DocxViewer,
    ControlPanel: null,
  },
  [FILE_TYPE.XLSX]: {
    Viewer: XlsxViewer,
    ControlPanel: null,
  },
  [FILE_TYPE.EML]: {
    Viewer: EmlViewer,
    ControlPanel: null,
  },
  [FILE_TYPE.UNSUPPORTED]: {
    // Viewer receives fileUrl but UnsupportedViewer only needs the extension;
    // we wrap it below to pass the right props.
    Viewer: () => null, // placeholder – overridden in render
    ControlPanel: null,
  },
};

// Empty state

const EmptyState = () => (
  <NoContentMessage
    primaryMessage="No files available"
    secondaryMessage="Upload a file to get started"
    Icon={FileWarningIcon}
  />
);

// Main component

export default function FileViewer({
  allowDelete,
  remoteFileLoader,
}: {
  allowDelete?: boolean;
  remoteFileLoader?: RemoteFileLoader;
}) {
  const { files, activeFileId, markFileLoading, markFileReady, markFileError, resetFileToIdle } =
    useLocalFileStore(
      useShallow((s) => ({
        files: s.files,
        activeFileId: s.activeFileId,
        markFileLoading: s.markFileLoading,
        markFileReady: s.markFileReady,
        markFileError: s.markFileError,
        resetFileToIdle: s.resetFileToIdle,
      })),
    );

  const resetViewer = useViewerStore((s) => s.reset);
  const resetPdf = usePdfViewerStore((s) => s.reset);

  // Reset shared viewer state (zoom, rotate) and PDF state whenever the
  // active file changes so each file starts fresh.
  useEffect(() => {
    resetViewer();
    resetPdf();
  }, [activeFileId, resetViewer, resetPdf]);

  const activeFile: LocalFile | undefined = files.find((f) => f.id === activeFileId);

  const fileType = getFileType(activeFile?.extension ?? "");
  const { Viewer, ControlPanel, PageControl } = VIEWER_REGISTRY[fileType];

  const loader = remoteFileLoader ?? defaultRemoteFileLoader;

  /**
   * React Query for fetching remote file data.
   * Leverages built-in caching, signal abortion, and request deduplication.
   */
  const fileQuery = useQuery({
    queryKey: ["file-viewer-data", activeFile?.id, activeFile?.sourceUrl],
    queryFn: async ({ signal }) => {
      if (!activeFile || !activeFile.sourceUrl) {
        throw new Error("Missing file information");
      }

      const result = await loader({
        fileUrl: activeFile.sourceUrl,
        credentialId: activeFile.credentialId,
        extension: activeFile.extension,
        name: activeFile.name,
        signal, // React Query provides the abort signal automatically
      });

      const blob = toBlob(result, activeFile.type);
      const objectUrl = URL.createObjectURL(blob);
      return { blob, objectUrl, size: blob.size };
    },
    // Only execute if it's a remote file and hasn't been successfully loaded yet.
    enabled: !!activeFile?.sourceUrl && activeFile.status !== "ready",
    staleTime: Infinity, // File data rarely changes at the same URL; avoid unnecessary refetches.
    retry: false, // Prevents compounding errors; user can manually retry via UI
  });

  /**
   * Synchronize React Query state with the Zustand local file store.
   * This maintains compatibility with other components observing activeFile.status.
   */
  useEffect(() => {
    if (!activeFile) return;

    if (fileQuery.isFetching && activeFile.status === "idle") {
      markFileLoading(activeFile.id);
    } else if (fileQuery.isSuccess && activeFile.status !== "ready") {
      markFileReady(activeFile.id, fileQuery.data.objectUrl, fileQuery.data.size);
    } else if (fileQuery.isError && activeFile.status !== "error") {
      markFileError(activeFile.id, getFileLoadErrorMessage(fileQuery.error));
    }
  }, [
    activeFile,
    fileQuery.isFetching,
    fileQuery.isSuccess,
    fileQuery.isError,
    fileQuery.data,
    fileQuery.error,
    markFileLoading,
    markFileReady,
    markFileError,
  ]);

  const viewerReady = activeFile?.status === "ready";
  const isLoadingFile = activeFile?.status === "loading";
  const hasError = activeFile?.status === "error";

  // Handle retry manually to bypass stale caching and reset the Zustand store
  const handleRetry = () => {
    if (!activeFile) return;
    resetFileToIdle(activeFile.id);
    fileQuery.refetch();
  };

  return (
    <div className="h-[calc(100vh-4.5rem-var(--header-height)-2*var(--header-padding))] flex flex-col">
      {files.length === 0 || !activeFile ? (
        <EmptyState />
      ) : (
        <>
          <FileViewerHeader
            controlPanel={ControlPanel ? <ControlPanel /> : undefined}
            pageControl={PageControl ? <PageControl /> : undefined}
            allowDelete={allowDelete}
          />

          <div className="relative flex-1 overflow-hidden bg-background">
            {viewerReady && (
              <>
                {fileType === FILE_TYPE.UNSUPPORTED ? (
                  <UnsupportedViewer extension={activeFile.extension} />
                ) : (
                  <Viewer fileUrl={activeFile.url!} />
                )}
              </>
            )}

            {isLoadingFile && activeFile && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 px-4">
                <div className="flex flex-col items-center gap-2 rounded-lg border border-border bg-background/90 px-4 py-5 text-center shadow-lg">
                  <LoadingSpinner className="h-6 w-6 text-primary" />
                  <p className="text-sm font-semibold text-foreground">Fetching file…</p>
                  <p className="text-xs text-muted-foreground">
                    Please wait while the file is retrieved.
                  </p>
                </div>
              </div>
            )}

            {hasError && activeFile && (
              <div
                className="absolute inset-0 flex items-center justify-center bg-background/80 px-4"
                role="alert"
                aria-live="assertive"
              >
                <div className="flex flex-col items-center gap-2 rounded-lg border border-amber-200 bg-background/90 px-5 py-6 text-center shadow-lg">
                  <AlertTriangleIcon className="size-6 text-amber-500" />
                  <p className="text-sm font-semibold text-foreground">Unable to load file</p>
                  <p className="text-xs text-muted-foreground">
                    {activeFile.error ?? "Try again to download the file."}
                  </p>
                  <Button size="sm" variant="outline" onClick={handleRetry}>
                    Retry
                  </Button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function toBlob(payload: RemoteFileLoaderResult, fallbackMimeType: string): Blob {
  if (payload instanceof Blob) {
    return payload;
  }

  if (payload instanceof ArrayBuffer) {
    return new Blob([payload], {
      type: fallbackMimeType,
    });
  }

  if (ArrayBuffer.isView(payload)) {
    // Create a copy backed by a normal ArrayBuffer
    const copy = new Uint8Array(
      new Uint8Array(payload.buffer, payload.byteOffset, payload.byteLength),
    );

    return new Blob([copy], {
      type: fallbackMimeType,
    });
  }

  if (typeof payload === "string") {
    return base64StringToBlob(payload, fallbackMimeType);
  }

  throw new Error("Unsupported file payload format");
}

function base64StringToBlob(base64String: string, fallbackMimeType: string): Blob {
  let mimeType = fallbackMimeType;
  let data = base64String;

  if (base64String.startsWith("data:")) {
    const [meta, encoded] = base64String.split(",");
    if (encoded) {
      data = encoded;
      const mimeMatch = meta.split(";")[0]?.replace(/^data:/, "");
      if (mimeMatch) {
        mimeType = mimeMatch;
      }
    }
  }

  const cleaned = data.replace(/\s/g, "");
  const binary = atob(cleaned);
  const length = binary.length;
  const buffer = new Uint8Array(length);

  for (let i = 0; i < length; i += 1) {
    buffer[i] = binary.charCodeAt(i);
  }

  return new Blob([buffer], { type: mimeType });
}

// Normalizes loader errors so the UI can display the reason it failed.
function getFileLoadErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const backendMessage = extractMessageFromResponse(error.response?.data);
    if (backendMessage) {
      return backendMessage;
    }

    return error.message || "Failed to load file";
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Failed to load file";
}

function extractMessageFromResponse(responseData: unknown): string | null {
  if (typeof responseData === "string") {
    return responseData.trim() ? responseData : null;
  }

  if (typeof responseData === "object" && responseData !== null) {
    const data = responseData as Record<string, unknown>;
    const message = data.message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }

    const nested = data.data;
    if (typeof nested === "string" && nested.trim()) {
      return nested;
    }
  }

  return null;
}

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === "object" &&
    error !== null &&
    "isAxiosError" in error &&
    (error as AxiosError).isAxiosError === true
  );
}

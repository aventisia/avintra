import { NoContentMessage } from "@avplatform/ui";
import { FileWarningIcon } from "lucide-react";
import { type ComponentType, useEffect } from "react";
import { useShallow } from "zustand/react/shallow";

import { type LocalFile, useLocalFileStore } from "../stores/file-list-store";
import { useViewerStore } from "../stores/file-viewer-store";
import { usePdfViewerStore } from "../stores/pdf-previewer-store";
import { FILE_TYPE, FileType, getFileType } from "../types/file-viewer-types";
import UnsupportedViewer from "./UnsupportedViewer";
import FileViewerHeader from "./file-viewer-header/FileViewerHeader";
import PageControl from "./file-viewer-header/PageControl";
import ImageControlPanel from "./image-viewer/ImageControlPanel";
import ImageViewer from "./image-viewer/ImageViewer";
import PdfControlPanel from "./pdf-viewer/PdfControlPanel";
import PdfViewer from "./pdf-viewer/PdfViewer";

//  Registry
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
  [FILE_TYPE.UNSUPPORTED]: {
    // Viewer receives fileUrl but UnsupportedViewer only needs the extension;
    // we wrap it below to pass the right props.
    Viewer: () => null, // placeholder – overridden in render
    ControlPanel: null,
  },
};

//  Empty state

const EmptyState = () => (
  <NoContentMessage
    primaryMessage="No files available"
    secondaryMessage="Upload a file to get started"
    Icon={FileWarningIcon}
  />
);

//  Main component

export default function FileViewer() {
  const { files, activeFileId } = useLocalFileStore(
    useShallow((s) => ({ files: s.files, activeFileId: s.activeFileId })),
  );

  const resetViewer = useViewerStore((s) => s.reset);
  const resetPdf = usePdfViewerStore((s) => s.reset);

  // Reset shared viewer state (zoom, rotate) and PDF state whenever the
  // active file changes so each file starts fresh.
  useEffect(() => {
    resetViewer();
    resetPdf();
  }, [activeFileId, resetViewer, resetPdf]);

  if (files.length === 0) return <EmptyState />;

  const activeFile: LocalFile | undefined = files.find((f) => f.id === activeFileId);
  if (!activeFile) return <EmptyState />;

  const fileType = getFileType(activeFile.extension);
  const { Viewer, ControlPanel, PageControl } = VIEWER_REGISTRY[fileType];

  return (
    <div className="h-[calc(100vh-4rem-var(--header-height)-3*var(--header-padding))]">
      <FileViewerHeader
        controlPanel={ControlPanel ? <ControlPanel /> : undefined}
        pageControl={PageControl ? <PageControl /> : undefined}
      />

      {fileType === FILE_TYPE.UNSUPPORTED ? (
        <UnsupportedViewer extension={activeFile.extension} />
      ) : (
        <Viewer fileUrl={activeFile.blobUrl} />
      )}
    </div>
  );
}

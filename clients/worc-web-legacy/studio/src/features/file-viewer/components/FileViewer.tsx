import { NoContentMessage } from "@aventisia/ui";
import { FileWarningIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useLocalFileStore } from "../stores/file-list-store";
import FileViewerHeader from "./FileViewerHeader";
import PdfControlPanel from "./pdf-viewer/PdfControlPanel";
import { PdfViewer } from "./pdf-viewer/PdfViewer";

export default function FileViewer() {
  const { files, activeFileId } = useLocalFileStore(
    useShallow((state) => ({
      files: state.files,
      activeFileId: state.activeFileId,
      setActiveFile: state.setActiveFile,
      removeFile: state.removeFile,
    })),
  );

  const currentIndex = files.findIndex((f) => f.id === activeFileId);
  const activeFile = files[currentIndex];
  if (files.length == 0) {
    return (
      <NoContentMessage
        primaryMessage="No files available"
        secondaryMessage="Please upload file to view"
        Icon={FileWarningIcon}
      />
    );
  }
  return (
    <div>
      <FileViewerHeader>
        <PdfControlPanel />
      </FileViewerHeader>
      <PdfViewer fileUrl={activeFile.blobUrl} />
    </div>
  );
}

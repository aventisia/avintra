import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@avplatform/ui/select";
import { FileIcon, ImageIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useLocalFileStore } from "../../stores/file-list-store";
import { FILE_TYPE, getFileType } from "../../types/file-viewer-types";

const FileViewerSelect = () => {
  const { files, activeFileId, setActiveFile } = useLocalFileStore(
    useShallow((s) => ({
      files: s.files,
      activeFileId: s.activeFileId,
      setActiveFile: s.setActiveFile,
    })),
  );

  // Guard: nothing to render if there are no files or no selection
  if (files.length === 0 || !activeFileId) return null;

  const activeFile = files.find((f) => f.id == activeFileId);

  const getFileTypeIcon = (fileName: string) => {
    const extension = fileName.split(".").pop() ?? "";

    const fileType = getFileType(extension);

    switch (fileType) {
      case FILE_TYPE.PDF:
        return <img src="assets/PDF.svg" className="size-4 shrink-0" />;
      case FILE_TYPE.IMAGE:
        return <ImageIcon className="size-4 text-primary-text shrink-0" />;

      default:
        return <FileIcon className="size-4 text-muted-foreground shrink-0" />;
    }
  };

  return (
    <Select value={activeFileId} onValueChange={setActiveFile}>
      <SelectTrigger size="sm" className="w-72 truncate">
        <SelectValue placeholder="Select a file">
          {activeFile && (
            <div className="flex items-center gap-2 overflow-hidden">
              {getFileTypeIcon(activeFile.name)}

              <span className="truncate">{activeFile.name}</span>
            </div>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {files.map((file) => (
          <SelectItem key={file.id} value={file.id}>
            <div className="flex items-center gap-2 overflow-hidden">
              {getFileTypeIcon(file.name)}

              <span className="truncate">{file.name}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FileViewerSelect;

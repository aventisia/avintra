import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";
import { useShallow } from "zustand/react/shallow";

import { useLocalFileStore } from "../../stores/file-list-store";

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

  return (
    <Select value={activeFileId} onValueChange={setActiveFile}>
      <SelectTrigger size="sm" className="w-72 truncate">
        <SelectValue placeholder="Select a file" />
      </SelectTrigger>
      <SelectContent>
        {files.map((file) => (
          <SelectItem key={file.id} value={file.id} className="truncate">
            {file.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default FileViewerSelect;

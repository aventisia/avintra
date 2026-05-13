import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@aventisia/ui/select";
import { useShallow } from "zustand/react/shallow";

import { useLocalFileStore } from "../stores/file-list-store";

const FileViewerSelect = () => {
  const { files, activeFileId, setActiveFile } = useLocalFileStore(
    useShallow((state) => ({
      files: state.files,
      activeFileId: state.activeFileId,
      setActiveFile: state.setActiveFile,
    })),
  );

  const currentIndex = files.findIndex((f) => f.id === activeFileId);
  const activeFile = files[currentIndex];

  return (
    <div className="w-96">
      <Select value={activeFile.id} onValueChange={(id) => setActiveFile(id)}>
        <SelectTrigger size="sm" className="">
          <SelectValue placeholder="Select File" />
        </SelectTrigger>
        <SelectContent>
          {files.map((file) => (
            <SelectItem key={file.id} value={file.id}>
              {file.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FileViewerSelect;

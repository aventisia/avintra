import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

import { cn } from "@aventisia/ui/lib";
import { useShallow } from "zustand/react/shallow";

import { useFileStore } from "../stores/file-uploader-store";
import FileDropzone from "./FileDropzone";
import FileUploadList from "./FileUploadList";

interface FileUploaderProps {
  side?: "right" | "bottom";
}

const FileUploader = ({ side = "right" }: FileUploaderProps) => {
  const {
    files,
    addFile,
    clearFiles,
    updateProgress,
    addFileToUpload,
    removeFile,
    filesToUpload,
  } = useFileStore(
    useShallow((state) => ({
      files: state.files,
      addFile: state.addFile,
      clearFiles: state.clearFiles,
      addFileToUpload: state.addFileToUpload,
      updateProgress: state.updateProgress,
      removeFile: state.removeFile,
      filesToUpload: state.filesToUpload,
    })),
  );

  const { modelId } = useLabelDataStore(
    useShallow((state) => ({
      modelId: state.modelId,
    })),
  );

  return (
    <div
      className={cn(
        "gap-6 rounded-lg border bg-white px-[1.4rem] py-6 shadow",
        side === "bottom" ? "space-y-4" : "flex h-full",
      )}
    >
      <FileDropzone
        files={files}
        addFile={addFile}
        addFileToUpload={addFileToUpload}
        modelId={modelId}
        updateProgress={updateProgress}
        side={side}
      />
      <FileUploadList
        files={files}
        clearFiles={clearFiles}
        modelId={modelId}
        filesToUpload={filesToUpload}
        removeFile={removeFile}
        side={side}
      />
    </div>
  );
};

export default FileUploader;

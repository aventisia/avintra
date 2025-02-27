import { useShallow } from "zustand/react/shallow";
import { useFileStore } from "../stores/file-uploader-store";
import FileDropzone from "./FileDropzone";
import FileUploadList from "./FileUploadList";
import { useLabelDataStore } from "@/features/label-data/stores/label-data-store";

const FileUploader = () => {
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
    <div className="flex gap-12 rounded-lg border bg-white p-12 shadow">
      <FileDropzone
        files={files}
        addFile={addFile}
        addFileToUpload={addFileToUpload}
        modelId={modelId}
        updateProgress={updateProgress}
      />
      <FileUploadList
        files={files}
        clearFiles={clearFiles}
        modelId={modelId}
        filesToUpload={filesToUpload}
        removeFile={removeFile}
      />
    </div>
  );
};

export default FileUploader;

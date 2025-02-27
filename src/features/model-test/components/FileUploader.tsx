import FileDropzone from "@/features/file-uploader/components/FileDropzone";
import FileUploadList from "@/features/file-uploader/components/FileUploadList";
import { useTestModelFileStore } from "../stores/model-test-file-store";
import { useShallow } from "zustand/react/shallow";
import { useModelTestStore } from "../stores/model-test-store";

const FileUploader = () => {
  const {
    files,
    addFile,
    clearFiles,
    updateProgress,
    addFileToUpload,
    removeFile,
    filesToUpload,
  } = useTestModelFileStore(
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

  const { modelId } = useModelTestStore(
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

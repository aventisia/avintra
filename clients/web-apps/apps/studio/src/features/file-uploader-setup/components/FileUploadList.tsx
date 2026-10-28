import { Button } from "@avplatform/ui/buttons";
import { TrashIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { Progress } from "@/react-toolkit/ui/progress";

import { FileState, useFileStore } from "../stores/file-uploader-store";
import { formatFileSize } from "../utils";
import FileDropzone from "./FileDropzone";

const FileUploadList = ({ isPublic }: { isPublic?: boolean }) => {
  const {
    files,
    filesToUpload,
    addFile,
    addFileToUpload,
    updateProgress,
    removeFile,
    clearFiles,
    addFileToDelete,
  } = useFileStore(
    useShallow((state) => ({
      files: state.files,
      filesToUpload: state.filesToUpload,
      addFile: state.addFile,
      addFileToUpload: state.addFileToUpload,
      addFileToDelete: state.addFileToDelete,
      updateProgress: state.updateProgress,
      removeFile: state.removeFile,
      clearFiles: state.clearFiles,
    })),
  );

  const cancelUpload = (controller?: AbortController | null) => {
    controller?.abort();
  };

  const removeAll = () => {
    filesToUpload.forEach((file) => {
      addFileToDelete(file); // server delete
    });
  };

  const handleDelete = (name: string) => {
    const uploadedFile = filesToUpload.find((f) => f.name === name);
    if (uploadedFile) addFileToDelete(uploadedFile);
  };

  const handleDeleteBefore = (file: FileState) => {
    cancelUpload(file.currentController);
    removeFile(file.name);
  };

  const getProgressForFile = (name: string): FileState | undefined =>
    files.find((f) => f.name === name);

  return (
    <div className="h-full rounded-lg border">
      <div className="flex items-center justify-between p-2">
        <h2 className="text-xs font-medium">Upload Files ({filesToUpload.length})</h2>
        <div className="flex gap-2">
          <FileDropzone
            addFile={addFile}
            addFileToUpload={addFileToUpload}
            updateProgress={updateProgress}
            clearFiles={clearFiles}
            isPublic={isPublic}
          />
          {filesToUpload.length > 0 && (
            <Button variant="ghost" size="xs" type="button" onClick={removeAll}>
              Delete All
            </Button>
          )}
        </div>
      </div>

      {(filesToUpload.length > 0 || files.length > 0) && (
        <div className="grid grid-cols-1 gap-2 border-t p-2 xs:grid-cols-2">
          {[...filesToUpload, ...files].map((file, idx) => {
            const fileState = getProgressForFile(file.name);
            const isUploading = fileState && fileState.progress < 100;
            const progress = fileState?.progress ?? 100;

            return (
              <div key={`${file.name}-${idx}`} className="rounded-lg border p-2">
                <div className="flex items-center justify-between pb-2">
                  <div className="flex flex-col">
                    <p className="text-2xs font-medium">{file.name}</p>
                    <p className="text-2xs text-muted-foreground">
                      {isUploading
                        ? `Uploading... ${progress}%`
                        : `${progress}% · ${formatFileSize(file.size)}`}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="caution"
                    size="icon7"
                    onClick={() =>
                      isUploading && fileState
                        ? handleDeleteBefore(fileState)
                        : handleDelete(file.name)
                    }
                  >
                    {isUploading ? (
                      <XCircleIcon className="h-5 w-5" />
                    ) : (
                      <TrashIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Progress value={progress} className={progress === 100 ? "bg-ok" : "bg-primary"} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default FileUploadList;

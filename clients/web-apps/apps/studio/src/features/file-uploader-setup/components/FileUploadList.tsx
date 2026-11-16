import { FileIcon, TrashIcon, XIcon } from "@phosphor-icons/react";
import { useShallow } from "zustand/react/shallow";

import { FileState, useFileStore } from "../stores/file-uploader-store";
import { formatFileSize } from "../utils";
import FileDropzone from "./FileDropzone";

type FileUploadListProps = {
  isPublic?: boolean;
  isDisabled?: boolean;
};

/**
 * Files attached to the form: a drop area and the uploaded or uploading files with their
 * progress.
 */
const FileUploadList = ({ isPublic, isDisabled = false }: FileUploadListProps) => {
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

  const removeAll = () => {
    filesToUpload.forEach((file) => addFileToDelete(file));
  };

  const handleDelete = (name: string) => {
    const uploadedFile = filesToUpload.find((f) => f.name === name);
    if (uploadedFile) addFileToDelete(uploadedFile);
  };

  const cancelUpload = (file: FileState) => {
    file.currentController?.abort();
    removeFile(file.name);
  };

  const allFiles = [...filesToUpload, ...files];

  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p className="text-[12.5px] font-semibold text-ink-2">
          Files
          <span className="ml-1.5 font-normal text-muted-foreground">Optional</span>
        </p>
        {filesToUpload.length > 0 && !isDisabled && (
          <button
            type="button"
            onClick={removeAll}
            className="rounded-sm text-[12px] text-muted-foreground outline-none transition-colors hover:text-bad focus-visible:ring-2 focus-visible:ring-focus"
          >
            Remove all
          </button>
        )}
      </div>

      <FileDropzone
        addFile={addFile}
        addFileToUpload={addFileToUpload}
        updateProgress={updateProgress}
        clearFiles={clearFiles}
        isPublic={isPublic}
        isDisabled={isDisabled}
      />

      {allFiles.length > 0 && (
        <ul className="mt-2 divide-y divide-line overflow-hidden rounded-md bg-popover ring-1 ring-line">
          {allFiles.map((file, idx) => {
            const fileState = files.find((f) => f.name === file.name);
            const isUploading = fileState !== undefined && fileState.progress < 100;
            const progress = fileState?.progress ?? 100;

            return (
              <li
                key={`${file.name}-${idx}`}
                className="relative flex items-center gap-3 px-3 py-2"
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-sunken text-ink-2 ring-1 ring-line">
                  <FileIcon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-ink">
                    {file.name}
                  </span>
                  <span className="block text-[11.5px] tabular-nums text-muted-foreground">
                    {isUploading ? `Uploading ${progress}%` : formatFileSize(file.size)}
                  </span>
                </span>
                <button
                  type="button"
                  aria-label={isUploading ? `Cancel uploading ${file.name}` : `Remove ${file.name}`}
                  onClick={() =>
                    isUploading && fileState ? cancelUpload(fileState) : handleDelete(file.name)
                  }
                  className="grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition hover:bg-bad/10 hover:text-bad focus-visible:ring-2 focus-visible:ring-focus disabled:hidden"
                >
                  {isUploading ? (
                    <XIcon className="size-3.5" />
                  ) : (
                    <TrashIcon className="size-3.5" />
                  )}
                </button>
                {isUploading && (
                  <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 bg-sunken">
                    <span
                      className="block h-full bg-primary transition-[width] duration-200"
                      style={{ width: `${progress}%` }}
                    />
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default FileUploadList;

import { cn } from "@avplatform/ui/lib";
import { UploadSimpleIcon } from "@phosphor-icons/react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { MAX_FILE_SIZE } from "../constants";
import { FileUploadDto } from "../dtos/file-upload-dto";
import { useFileUpload } from "../hooks/useFileUpload";
import { FileState } from "../stores/file-uploader-store";

interface Props {
  addFile: (file: FileState) => void;
  addFileToUpload: (file: FileUploadDto) => void;
  updateProgress: (name: string, progress: number) => void;
  clearFiles: () => void;
  isPublic?: boolean;
  isDisabled?: boolean;
}

/**
 * Dashed drop area that uploads dropped or browsed files.
 */
const FileDropzone = ({
  addFile,
  addFileToUpload,
  updateProgress,
  clearFiles,
  isPublic,
  isDisabled = false,
}: Props) => {
  const { mutate: uploadFile, currentController } = useFileUpload({
    addFileToUpload,
    updateProgress,
    clearFiles,
    isPublic,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        addFile({
          name: file.name,
          size: file.size,
          progress: 0,
          currentController,
          type: file.type,
        });
        uploadFile(file);
      });
    },
    [addFile, uploadFile, currentController],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isDisabled,
  });

  return (
    <div
      {...getRootProps({ "aria-label": "Upload files" })}
      className={cn(
        "flex items-center gap-3 rounded-md border border-dashed px-3.5 py-3 outline-none transition-colors focus-visible:ring-2 focus-visible:ring-focus",
        isDisabled
          ? "cursor-default opacity-60"
          : "cursor-pointer hover:border-line-strong hover:bg-sunken/80",
        isDragActive ? "border-focus bg-focus/[0.06]" : "border-line bg-sunken/50",
      )}
    >
      <input {...getInputProps()} />
      <span className="grid size-8 shrink-0 place-items-center rounded-md bg-popover text-ink-2 ring-1 ring-line">
        <UploadSimpleIcon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="block text-[13px] font-medium text-ink">
          {isDragActive ? (
            "Drop to upload"
          ) : (
            <>
              Drop files here or <span className="text-primary-text">browse</span>
            </>
          )}
        </span>
        <span className="block text-[12px] text-muted-foreground">
          Documents, sheets or images up to {MAX_FILE_SIZE / 1024 / 1024} MB each
        </span>
      </span>
    </div>
  );
};

export default FileDropzone;

"use client";

import { Button, buttonVariants } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { ScrollArea } from "@avplatform/ui/scroll";
import { CloudUploadIcon, FileTextIcon, Loader2Icon, Trash2Icon, XIcon } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo } from "react";
import { useDropzone } from "react-dropzone";
import { useShallow } from "zustand/react/shallow";

import { FileUploadDto } from "../apis/file-upload-apis";
import { useFileDelete, useFileUpload } from "../hooks/useFileUpload";
import { FileState, useFileStore } from "../store/file-uploader-store";
import { formatFileSize } from "../utils/file-uploader-util";

interface DropzoneProps {
  addFile: (file: FileState) => void;
  acceptedTypes?: Record<string, string[]>;
}

export const FileDropzone = ({ addFile, acceptedTypes }: DropzoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        addFile({
          id: crypto.randomUUID(),
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: "staged",
          file: file,
        });
      });
    },
    [addFile],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
    accept: acceptedTypes,
  });

  // Dynamically generates the supported formats string
  const acceptedFormatsText = useMemo(() => {
    if (!acceptedTypes) return "All file types supported";
    const extensions = Object.values(acceptedTypes)
      .flat()
      .map((ext) => ext.replace(".", "").toUpperCase());
    return extensions.length > 0 ? `Supported formats: ${extensions.join(", ")}` : "";
  }, [acceptedTypes]);

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer bg-white w-full min-h-[30vh]",
        isDragActive ? "border-primary bg-primary/5" : "border-gray-300",
      )}
      onClick={open}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon size={56} className="text-gray-400 opacity-60 mb-4" />
      <div className="text-sm text-center">
        {isDragActive ? (
          <p className="font-medium text-primary">Drop the files here...</p>
        ) : (
          <div className="flex flex-col justify-center gap-3">
            <p className="text-sm font-medium">
              Drag & drop or{" "}
              <span className={cn(buttonVariants({ variant: "link" }), "px-1")}>Browse file</span>
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              {acceptedFormatsText}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT & TYPES
// ============================================================================

export interface FileUploaderProps {
  isPublic?: boolean;
  maxSize?: number;
  acceptedTypes?: Record<string, string[]>;
  disclaimer?: React.ReactNode;
  footer?: React.ReactNode;
  hideFooter?: boolean;
  clearOnUnMount?: boolean;
  onCancel?: () => void;
  onUploadSuccess?: (data: FileUploadDto[]) => void;
  /** NEW: Callback fired if a user deletes a file after it was uploaded */
  onFileDelete?: (deletedFile: FileUploadDto) => void;
}

export interface FileUploaderRef {
  uploadStagedFiles: () => Promise<FileUploadDto[]>;
  clearAllFiles: () => void;
  hasStagedFiles: boolean;
}

export const FileUploader = forwardRef<FileUploaderRef, FileUploaderProps>(
  (
    {
      isPublic = false,
      maxSize = 5 * 1024 * 1024,
      acceptedTypes,
      disclaimer,
      hideFooter = false,
      onCancel,
      onUploadSuccess,
      onFileDelete,
      clearOnUnMount = true,
      footer,
    },
    ref,
  ) => {
    const { files, addFile, updateFile, removeFile, clearAll } = useFileStore(
      useShallow((state) => ({
        files: state.files,
        addFile: state.addFile,
        updateFile: state.updateFile,
        removeFile: state.removeFile,
        clearAll: state.clearAll,
      })),
    );

    const { mutateAsync: uploadFiles, isPending } = useFileUpload({
      updateFile,
      isPublic,
      maxSize,
      acceptedTypes,
    });

    const { mutateAsync: deleteRemoteFile } = useFileDelete({
      updateFile,
      removeFile,
      isPublic,
    });

    const stagedFiles = files.filter((f) => f.status === "staged" || f.status === "error");

    const handleUploadAll = async (): Promise<FileUploadDto[]> => {
      if (stagedFiles.length === 0) return [];
      const results = await uploadFiles(stagedFiles);
      const successfulUploads = results.filter((item): item is FileUploadDto => item !== undefined);
      if (successfulUploads.length > 0) onUploadSuccess?.(successfulUploads);
      return successfulUploads;
    };

    useImperativeHandle(ref, () => ({
      uploadStagedFiles: handleUploadAll,
      clearAllFiles: clearAll,
      hasStagedFiles: stagedFiles.length > 0,
    }));

    /**
     * Intelligent action handler.
     * 1. If successfully uploaded: Delete from server.
     * 2. If uploading: Abort in-flight request.
     * 3. Else (staged/error): Just clear from UI.
     */
    const handleActionClick = async (file: FileState) => {
      if (file.status === "success" && file.uploadedData) {
        try {
          await deleteRemoteFile({ id: file.id, dto: file.uploadedData });
          onFileDelete?.(file.uploadedData); // Inform parent component
        } catch (error) {
          // Error handled in hook
          console.log(error);
        }
      } else if (file.status === "uploading" && file.currentController) {
        file.currentController.abort();
        removeFile(file.id);
      } else {
        removeFile(file.id);
      }
    };

    useEffect(() => {
      return () => {
        if (clearOnUnMount) clearAll();
      };
    }, [clearAll, clearOnUnMount]);

    return (
      <div className="flex flex-col h-full w-full bg-white">
        <ScrollArea className="flex-1 p-4">
          <div className="flex flex-col gap-4">
            <FileDropzone addFile={addFile} acceptedTypes={acceptedTypes} />

            {files.length > 0 && (
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-medium text-slate-700">Selected Files</h4>
                <div className="flex flex-col gap-2">
                  {files.map((file) => {
                    const isUploading = file.status === "uploading";
                    const isSuccess = file.status === "success";
                    const isError = file.status === "error";
                    const isDeleting = file.status === "deleting";

                    return (
                      <div
                        key={file.id}
                        className="flex items-center justify-between rounded-xl bg-muted p-2"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-white rounded-full flex items-center justify-center h-10 w-10 shadow-sm border border-indigo-100">
                            <FileTextIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-medium truncate max-w-[200px]">
                              {file.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {isUploading && `Uploading... ${file.progress}%`}
                              {isDeleting && <span className="text-orange-500">Deleting...</span>}
                              {isSuccess && (
                                <span className="text-green-600">Uploaded successfully</span>
                              )}
                              {isError && <span className="text-red-500">Upload failed</span>}
                              {file.status === "staged" && formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>

                        {/* Dynamic Action Button */}
                        <Button
                          type="button"
                          onClick={() => handleActionClick(file)}
                          variant="caution"
                          size="icon7"
                          disabled={isDeleting}
                          aria-label={isSuccess ? "Delete file" : "Remove file"}
                        >
                          {isDeleting ? (
                            <Loader2Icon className="h-4 w-4 animate-spin" />
                          ) : isSuccess ? (
                            <Trash2Icon className="h-4 w-4" /> // Show Trash if uploaded
                          ) : (
                            <XIcon className="h-4 w-4" /> // Show X to abort or clear
                          )}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {disclaimer && <div className="mt-2">{disclaimer}</div>}
          </div>
        </ScrollArea>

        {!hideFooter && (
          <div className="flex justify-end gap-3 p-4 border-t mt-auto bg-gray-50/50">
            {onCancel && (
              <Button variant="outline" onClick={onCancel} disabled={isPending}>
                Cancel
              </Button>
            )}
            <Button onClick={handleUploadAll} disabled={isPending || stagedFiles.length === 0}>
              {isPending ? "Uploading..." : "Upload Files"}
            </Button>
            {footer}
          </div>
        )}
      </div>
    );
  },
);

FileUploader.displayName = "FileUploader";

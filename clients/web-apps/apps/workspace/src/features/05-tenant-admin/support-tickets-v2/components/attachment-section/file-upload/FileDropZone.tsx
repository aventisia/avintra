import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { CloudArrowUpIcon } from "@phosphor-icons/react";
import { useDropzone } from "react-dropzone";

import { ACCEPTED_FILE_TYPES } from "./constants";

interface FileDropZoneProps {
  onDrop: (files: File[]) => void;
}

/** Drag-and-drop zone for selecting files to upload */
export const FileDropZone = ({ onDrop }: FileDropZoneProps) => {
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_FILE_TYPES,
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex items-center h-[10rem] justify-center rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-line-strong hover:border-primary hover:bg-primary/5",
      )}
      onClick={open}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center gap-1">
        {isDragActive ? (
          <span className="text-sm text-primary">Drop files here...</span>
        ) : (
          <>
            <CloudArrowUpIcon className="text-muted-foreground size-8 opacity-50" />
            <span className="text-sm font-medium text-ink-2 block">
              Drag & Drop or{" "}
              <Button
                autoFocus
                variant="link"
                type="button"
                className="text-primary hover:underline"
              >
                Choose file
              </Button>{" "}
              to upload
            </span>
            <span className="text-2xs text-muted-foreground">
              Supported formats: PDF, DOC, XLS, PNG, JPG, GIF, TXT, CSV
            </span>
          </>
        )}
      </div>
    </div>
  );
};

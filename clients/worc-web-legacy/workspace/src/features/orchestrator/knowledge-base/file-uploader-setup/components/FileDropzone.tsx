import { buttonVariants } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { CloudUploadIcon } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { FileState } from "../stores/file-uploader-store";

interface Props {
  addFile: (file: FileState) => void;
}

const FileDropzone = ({ addFile }: Props) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        addFile({
          id: crypto.randomUUID(), // Unique ID for list rendering & tracking
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
          status: "staged",
          file: file, // Store actual file object
        });
      });
    },
    [addFile],
  );

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-full flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors cursor-pointer bg-white w-full min-h-[30vh]",
        isDragActive ? "border-primary " : "border-gray-300",
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
            <p className="text-sm font-medium ">
              Drag & drop or{" "}
              <span className={cn(buttonVariants({ variant: "link" }))}>
                Browse file
              </span>
            </p>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Documents, Audio, Text (jpg, jpeg, png, doc, docx, pdf, txt, mp4,
              mpeg, webm, mp3, wav)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDropzone;

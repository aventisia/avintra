// import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { CloudUploadIcon } from "lucide-react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

import { FileUploadDto } from "../dtos/file-upload-dto";
import { useFileUpload } from "../hooks/useFileUpload";
import { FileState } from "../stores/file-uploader-store";

interface FileDropzoneProps {
  modelId: string;
  files: FileState[];
  addFile: (file: FileState) => void;
  addFileToUpload: (file: FileUploadDto) => void;
  updateProgress: (name: string, progress: number) => void;
}

const FileDropzone = ({
  addFile,
  addFileToUpload,
  updateProgress,
  modelId,
}: FileDropzoneProps) => {
  const { mutate: uploadFile, currentController } = useFileUpload({
    addFileToUpload,
    updateProgress,
    modelId,
  });

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        addFile({
          name: file.name,
          progress: 0,
          size: file.size,
          file,
          currentController,
        });
        uploadFile(file);
      });
    },
    [addFile, currentController, uploadFile],
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
      "audio/mpeg": [".mp3"], // MP3
      "audio/wav": [".wav"], // WAV
      "audio/ogg": [".ogg", ".oga"], // OGG (Vorbis)
      "audio/aac": [".aac"], // AAC
      "audio/opus": [".opus"], // Opus
    },
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer bg-primary-foreground w-full min-h-[50vh]",
        isDragActive ? "border-primary " : "border-gray-300",
      )}
      onClick={open}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon size={96} className="text-muted-foreground opacity-40" />
      <div className="mt-4 text-center">
        {isDragActive ? (
          "Drop the files here..."
        ) : (
          <div className="flex flex-col justify-center gap-4">
            <div>
              <p className="font-medium">
                {" "}
                Drag & drop or{" "}
                <span className="underline text-primary">Browse files</span>
              </p>
            </div>
            <p className="text-muted-foreground">
              Documents, text, audio, and images (pdf, jpg, jpeg, png, webp,
              mp3, wav, ogg, aac, opus )
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDropzone;

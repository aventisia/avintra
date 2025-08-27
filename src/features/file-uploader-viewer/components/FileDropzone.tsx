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
      // Document formats
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "text/csv": [".csv"],
      "application/msword": [".rtf"],
      "application/vnd.oasis.opendocument.text": [".odt"],
      "text/markdown": [".md"],
      "text/plain": [".txt"],
      // Audio formats
      "audio/mpeg": [".mp3"],
      "audio/aac": [".aac"],
      "audio/wav": [".wav"],
      "audio/ogg": [".ogg", ".oga"],
      "audio/opus": [".opus"],
      // Image formats
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/bmp": [".bmp"],
      "image/tiff": [".tiff", ".tif"],
      "image/webp": [".webp"],
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
              Documents, audio, and images <br /> (
              {/* Document formats (prettier-ignore) */}
              <span title="Portable Document Format">pdf</span>,{" "}
              <span title="Microsoft Word Document">docx</span>,{" "}
              <span title="Microsoft Excel Spreadsheet">xlsx</span>,{" "}
              <span title="Comma-Separated Values">csv</span>,{" "}
              <span title="Rich Text Format">rtf</span>,{" "}
              <span title="OpenDocument Text">odt</span>,{" "}
              <span title="Markdown">md</span>,{" "}
              <span title="Plain Text">txt</span>,
              {/* Audio formats (prettier-ignore) */}
              <span title="MP3 Audio">mp3</span>,{" "}
              <span title="Advanced Audio Coding">aac</span>,{" "}
              <span title="WAV Audio">wav</span>,{" "}
              <span title="Ogg Vorbis Audio">ogg</span>,{" "}
              <span title="Ogg Vorbis Audio">ogg</span>,{" "}
              <span title="Opus Audio">opus</span>,
              {/* Image formats (prettier-ignore) */}
              <span title="JPEG Image">jpg</span>,{" "}
              <span title="JPEG Image">jpeg</span>,{" "}
              <span title="Portable Network Graphics">png</span>,{" "}
              <span title="Bitmap Image">bmp</span>,{" "}
              <span title="Tagged Image File Format">tiff</span>,{" "}
              <span title="Tagged Image File Format">tif</span>)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileDropzone;

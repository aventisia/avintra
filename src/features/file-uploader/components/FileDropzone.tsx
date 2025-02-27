import { useCallback } from "react";
import { cn } from "@/react-toolkit/lib/utils";
import { CloudUploadIcon } from "lucide-react";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { useFileUpload } from "../hooks/useFileUpload";
import { useDropzone } from "react-dropzone";
import { FileState } from "../stores/file-uploader-store";
import OrSeparator from "./ORSeperator";
import { FileUploadDto } from "../dtos/file-upload-dto";

interface FileDropzoneProps {
  modelId: string;
  files: FileState[];
  addFile: (file: FileState) => void;
  addFileToUpload: (file: FileUploadDto) => void;
  updateProgress: (name: string, progress: number) => void;
}

const FileDropzone = ({
  files,
  addFile,
  addFileToUpload,
  updateProgress,
  modelId,
}: FileDropzoneProps) => {
  const { mutate: uploadFile } = useFileUpload({
    addFileToUpload,
    updateProgress,
    modelId,
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      addFile({ name: file.name, progress: 0, size: file.size, file });
      uploadFile(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    noClick: true,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex h-[calc(75vh-5.5rem)] flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors",
        isDragActive
          ? "border-primary bg-primary-foreground"
          : "border-gray-300 bg-slate-50",
        files.length > 0 ? "w-1/2" : "w-full",
      )}
    >
      <input {...getInputProps()} />
      <CloudUploadIcon size={96} className="text-muted-foreground opacity-40" />
      <p className="mt-4 text-center">
        {isDragActive ? (
          "Drop the files here..."
        ) : (
          <div className="flex flex-col justify-center gap-4">
            <div>
              <p className="font-medium"> Drag & drop PDF files.</p>
              <p className="text-xs text-muted-foreground">
                Supported format: PDF
              </p>
            </div>
            <OrSeparator />
            <Button onClick={() => open()} size={"xs"}>
              Browse files
            </Button>
          </div>
        )}
      </p>
    </div>
  );
};

export default FileDropzone;

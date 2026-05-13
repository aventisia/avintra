import { useLocalFileStore } from "@/features/file-viewer/stores/file-list-store";

import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { CloudUploadIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";

const FileUploadStep = () => {
  const addFiles = useLocalFileStore((state) => state.addFiles);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { "application/pdf": [".pdf"] }, // Restrict to PDFs since we are passing to react-pdf
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        addFiles(acceptedFiles); // Push directly to Zustand
      }
    },
  });

  return (
    <div className="flex flex-col gap-4 ">
      <div
        {...getRootProps()}
        className={cn(
          "flex items-center h-[10rem] justify-center rounded-lg border-2 border-dashed p-4 cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-primary hover:bg-primary/5",
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-1">
          {isDragActive ? (
            <span className="text-sm text-primary">Drop files here...</span>
          ) : (
            <>
              <CloudUploadIcon className="text-muted-foreground size-8 stroke-[1.4] opacity-50" />
              <span className="block text-sm font-medium text-gray-600">
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
              <span className="text-muted-foreground text-2xs">
                Supported formats: PDF, DOCX, XLSX, CSV, RTF, ODT, MD, TXT, JPG,
                JPEG, PNG, BMP, TIFF, TIF
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadStep;

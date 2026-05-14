import { useLocalFileStore } from "@/features/file-viewer/stores/file-list-store";

import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { CloudUploadIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useShallow } from "zustand/react/shallow";

const FileUploadStep = () => {
  const addFiles = useLocalFileStore(useShallow((state) => state.addFiles));

  const SUPPORTED_FILE_TYPES = {
    // Documents
    "application/pdf": [".pdf"],

    // Word / Rich Text
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
      ".docx",
    ],
    "application/rtf": [".rtf"],
    "application/vnd.oasis.opendocument.text": [".odt"],
    "text/markdown": [".md"],
    "text/plain": [".txt"],

    // Excel / CSV
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
      ".xlsx",
    ],
    "text/csv": [".csv"],

    // Images
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/bmp": [".bmp"],
    "image/tiff": [".tiff", ".tif"],
  } as const;

  const SUPPORTED_FORMAT_LABEL = Object.values(SUPPORTED_FILE_TYPES)
    .flat()
    .map((ext) => ext.replace(".", "").toUpperCase())
    .join(", ");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: SUPPORTED_FILE_TYPES,
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
                Supported formats: {SUPPORTED_FORMAT_LABEL}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileUploadStep;

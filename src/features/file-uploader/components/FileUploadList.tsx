import { Button } from "@/react-toolkit/ui/buttons/Button";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { Progress } from "@/react-toolkit/ui/progress";
import { useFileStore } from "../stores/file-uploader-store";
import { useFileDelete } from "../hooks/useFileDelete";
import { useShallow } from "zustand/react/shallow";

const FileUploadList = () => {
  const { files, clearFiles } = useFileStore(
    useShallow((state) => ({
      files: state.files,
      clearFiles: state.clearFiles,
    })),
  );
  const { mutate: deleteFile } = useFileDelete();
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <>
      {!!files.length && (
        <div className="h-[calc(75vh-5.5rem)] w-1/2 rounded-lg border">
          {/* Title Section */}
          <div className="flex items-center justify-between border-b p-2">
            <h2 className="text-md font-medium">
              Uploaded Files ({files.length})
            </h2>
            <Button variant="ghost" size="xs" onClick={() => clearFiles()}>
              Cancel
            </Button>
          </div>

          {/* List of Files */}
          <ScrollArea className="h-[calc(75vh-8rem)]">
            {files.map((file) => {
              const progress = file.progress;
              return (
                <>
                  <div key={file.name} className="border-b p-3">
                    <div className="flex items-center justify-between pb-3">
                      <div>
                        <p className="text-sm font-medium"> {file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {progress === 100
                            ? `${progress}% · ${formatFileSize(file.size || 0)}`
                            : `Uploading... ${progress}%`}
                        </p>
                      </div>
                      <XCircleIcon
                        className="h-5 w-5 cursor-pointer text-muted-foreground opacity-40 hover:opacity-60"
                        onClick={() => deleteFile(file)}
                      />
                      {/* )} */}
                    </div>
                    <Progress
                      value={progress}
                      className={
                        progress === 100
                          ? "bg-success-foreground"
                          : "bg-primary"
                      }
                    />
                  </div>
                </>
              );
            })}
          </ScrollArea>
        </div>
      )}
    </>
  );
};

export default FileUploadList;

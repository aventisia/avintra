import { Button } from "@/react-toolkit/ui/buttons/Button";
import { ScrollArea } from "@/react-toolkit/ui/scroll-area";
import { XCircleIcon } from "@heroicons/react/24/solid";
import { Progress } from "@/react-toolkit/ui/progress";
import { FileState } from "../stores/file-uploader-store";
import { useFileDelete } from "../hooks/useFileDelete";
import { formatFileSize } from "../utils";
import { FileUploadDto } from "../dtos/file-upload-dto";
import { TrashIcon } from "@heroicons/react/24/outline";
interface FileUploadListProps {
  files: FileState[];
  clearFiles: () => void;
  modelId: string;
  filesToUpload: FileUploadDto[];
  removeFile: (name: string | undefined) => void;
}
const FileUploadList = ({
  files,
  filesToUpload,
  modelId,
  removeFile,
}: FileUploadListProps) => {
  const { mutate: deleteFile } = useFileDelete({
    filesToUpload,
    modelId,
    removeFile,
  });

  const cancelUpload = (
    currentController: AbortController | null | undefined,
  ) => {
    if (currentController) {
      currentController.abort();
    }
  };

  const removeFiles = async () => {
    await Promise.all(files.map((file: FileUploadDto) => deleteFile(file)));
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
            <Button variant="ghost" size="xs" onClick={() => removeFiles()}>
              {files.length === filesToUpload.length && files.length != 0
                ? "Delete all"
                : "Cancel"}
            </Button>
          </div>

          {/* List of Files */}
          <ScrollArea className="h-[calc(75vh-8.6rem)] py-0.5">
            {files.map((file) => {
              const progress = file.progress;
              return (
                <>
                  <div key={file.name} className="border-b p-3 last:border-b-0">
                    <div className="flex items-center justify-between pb-3">
                      <div>
                        <p className="text-sm font-medium"> {file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {progress === 100
                            ? `${progress}% · ${formatFileSize(file.size || 0)}`
                            : `Uploading... ${progress}%`}
                        </p>
                      </div>
                      <Button variant={"ghost"} size={"icon8"}>
                        {(progress as number) < 100 ? (
                          <XCircleIcon
                            className="h-5 w-5 cursor-pointer text-muted-foreground opacity-40 hover:opacity-60"
                            onClick={() =>
                              cancelUpload(file?.currentController)
                            }
                          />
                        ) : (
                          <TrashIcon
                            className="h-4 w-4 cursor-pointer text-muted-foreground opacity-40 hover:opacity-60"
                            onClick={() => deleteFile(file)}
                          />
                        )}
                      </Button>
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

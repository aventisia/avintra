import { submitFiles } from "@/features/file-uploader-viewer/apis/file-upload-apis";
import FileUploader from "@/features/file-uploader-viewer/components/FileUploader";
import { useFileStore } from "@/features/file-uploader-viewer/stores/file-uploader-store";
import MultiFormatViewer from "@/features/multi-format-viewer/MultiFormatViewer";
import { useFetchUploadedFiles } from "@/features/multi-format-viewer/hooks/useFetchFiles";

import { LoadingSpinner, Separator } from "@aventisia/ui";
import { Button } from "@aventisia/ui/buttons";
import { ScrollArea } from "@aventisia/ui/scroll";
import { toast } from "@aventisia/ui/sonner";
import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { storageData } from "../constants/storage-data";
import { useToggleCredentailsDialogStore } from "../store/toggle-add-credentials-store";

const FileUploaderWrapper = () => {
  const { setShowAddCredentailsDialog, setCloudServiceName } =
    useToggleCredentailsDialogStore();
  const { files } = useFileStore(
    useShallow((state) => ({
      files: state.files,
    })),
  );
  const { data: fileList, refetch } = useFetchUploadedFiles("viewer");
  const { filesToUpload, clearFiles } = useFileStore(
    useShallow((state) => ({
      filesToUpload: state.filesToUpload,
      clearFiles: state.clearFiles,
    })),
  );
  const [fileInsertLoading, setFileInsertLoading] = useState(false);
  const handleInsertFiles = async () => {
    if (filesToUpload.length > 0) {
      setFileInsertLoading(true);
      try {
        await submitFiles(filesToUpload);
        refetch();
      } catch (error) {
        console.error("Error fetching data or mutating:", error);
      }
      clearFiles();
      // refetchList();
      setFileInsertLoading(false);
    } else {
      toast.error("Please upload a file before submitting.");
    }
  };

  if (fileList && fileList.data.length > 0) {
    return <MultiFormatViewer />;
  }

  return (
    <>
      <ScrollArea className="px-4 py-6 bg-white h-[calc(100vh-4.6rem)] border rounded-lg">
        <div className="flex flex-col justify-center gap-6 min-h-[calc(84.5vh)] py-2 px-4">
          <div className="flex flex-col gap-4">
            <FileUploader />
            {files && files.length > 0 && (
              <Button
                size="xs"
                type="button"
                className="self-end w-20"
                onClick={handleInsertFiles}
              >
                {fileInsertLoading ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  "Save"
                )}
              </Button>
            )}
          </div>

          <div className="hidden items-center justify-center gap-1">
            <Separator className="w-[47%]" />
            <p className="w-[6%] text-center">OR</p>
            <Separator className="w-[47%]" />
          </div>

          <div className="hidden justify-center content-center text-center gap-6">
            <p className="text-lg">Connect to Cloud Storage</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {storageData.map((item) => {
                return (
                  <Button
                    key={item.id}
                    variant="outline"
                    className="flex items-center justify-center gap-2 px-10 py-4 rounded-lg shadow-sm"
                    onClick={() => {
                      setCloudServiceName(item.name);
                      setShowAddCredentailsDialog(true);
                    }}
                  >
                    <img src={item.logo} alt="" />
                    <p>{item.name}</p>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
      </ScrollArea>
    </>
  );
};

export default FileUploaderWrapper;

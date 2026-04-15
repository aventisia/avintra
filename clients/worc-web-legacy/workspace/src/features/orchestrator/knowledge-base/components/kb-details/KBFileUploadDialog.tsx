import { FileUploadDto } from "@/components/file-uploader/apis/file-upload-apis";
import { FileUploader } from "@/components/file-uploader/components";
import { useFileStore } from "@/components/file-uploader/store/file-uploader-store";

import { Button } from "@aventisia/ui/buttons";
import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
import { useState } from "react";
// import { ScrollArea } from "@aventisia/ui/scroll";
import { useShallow } from "zustand/react/shallow";

// import FileUploadList from "../../file-uploader-setup/components/FileUploadList";
import { useKBFilesDialogStore } from "../../stores/kb-files-upload-dialog-store";
import FileUploadDisclaimer from "./FileUploadDisclaimer";
import { KBAddFileForm } from "./KBAddFileForm";
import { KBAddTextForm } from "./KBAddTextForm";

export const KBFileUploadDialog = () => {
  // Get crud dialog store state
  const { showDialog, setShowDialog, type } = useKBFilesDialogStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
      type: state.type,
    })),
  );
  const [uploadStep, setUploadStep] = useState(0);
  const [files, setFiles] = useState<FileUploadDto[]>([]);

  const onUploadSuccess = (data: FileUploadDto[]) => {
    setFiles(data);
  };
  // Grab the clear function directly from your global store
  const clearAllFiles = useFileStore((state) => state.clearAll);
  /**
   * This is the master handler for the Dialog opening and closing.
   */
  const handleOpenChange = (open: boolean) => {
    setShowDialog(open);

    // If the dialog is closing, reset the steps AND wipe the files from memory!
    if (!open) {
      setTimeout(() => {
        setUploadStep(0); // Reset back to step 1 for next time
        clearAllFiles(); // Manually wipe the global Zustand store
      }, 0); // Small delay lets the closing animation finish before wiping UI
    }
  };
  // Return dialog
  return (
    <Dialog open={showDialog} onOpenChange={handleOpenChange}>
      <DialogContent
        side={"center"}
        className="!max-w-3xl  h-[calc(85vh)] flex flex-col p-0 overflow-hidden"
      >
        <DialogDefaultHeader
          heading={type == "text" ? "Raw Text Input" : "Upload Files"}
          className="p-3"
        />
        <div className="flex-1  overflow-hidden">
          {type == "text" ? (
            <KBAddTextForm />
          ) : (
            <>
              {uploadStep == 0 && (
                <FileUploader
                  disclaimer={<FileUploadDisclaimer />}
                  acceptedTypes={{
                    "application/pdf": [".pdf"],
                    "image/jpeg": [".jpg", ".jpeg"],
                  }}
                  onUploadSuccess={onUploadSuccess}
                  clearOnUnMount={false}
                  footer={
                    <Button
                      disabled={files?.length == 0}
                      onClick={() => setUploadStep(1)}
                    >
                      Continue
                    </Button>
                  }
                />
              )}
              {uploadStep == 1 && (
                <KBAddFileForm files={files} setUploadStep={setUploadStep} />
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

import {
  Dialog,
  DialogContent,
  DialogDefaultHeader,
} from "@aventisia/ui/dialog";
// import { ScrollArea } from "@aventisia/ui/scroll";
import { useShallow } from "zustand/react/shallow";

import { useKBFilesDialogStore } from "../../stores/kb-files-upload-dialog-store";
import { KBAddTextForm } from "./KBAddTextForm";
import FileUploadList from "../../file-uploader-setup/components/FileUploadList";

export const KBFileUploadDialog = () => {
  // Get crud dialog store state
  const { showDialog, setShowDialog, type } = useKBFilesDialogStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
      type: state.type,
    })),
  );

  // Return dialog
  return (
    <Dialog
      open={showDialog}
      onOpenChange={(open: boolean) => {
        setShowDialog(open);
      }}
    >
      <DialogContent side={"center"} className="!max-w-3xl  h-[calc(85vh)]">
        <DialogDefaultHeader
          heading={type == "text" ? "Raw Text Input" : "Upload Files"}
          className="p-3"
        />
        {type == "text" ? <KBAddTextForm /> : <FileUploadList />}
      </DialogContent>
    </Dialog>
  );
};

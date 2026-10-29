import { Button } from "@avplatform/ui/buttons";
import { Dialog, DialogContent, DialogDefaultHeader } from "@avplatform/ui/dialog";
import { ScrollArea } from "@avplatform/ui/scroll";
import { useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useQueueUploadItemsStore } from "../../stores/queues-upload-item-store";
import { UploadItemsForm } from "./upload-items-form/UploadItemsForm";

const UploadItemsDialog = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const { showDialog, setShowDialog } = useQueueUploadItemsStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      setShowDialog: state.setShowDialog,
    })),
  );

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent side={"right"} className="!max-w-[60rem]">
        <DialogDefaultHeader
          heading="Upload items"
          children={
            <>
              <Button className="mr-2" onClick={handleClick} type="button" variant={"link"}>
                Browse file
              </Button>
            </>
          }
        />
        <ScrollArea className="h-[calc(100vh-4rem)] px-2.5 pb-0 pt-4">
          <UploadItemsForm fileInputRef={fileInputRef} />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default UploadItemsDialog;

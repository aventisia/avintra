import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { useAlertDialogStore } from "@/react-toolkit/stores/alert-dialog-store";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useShallow } from "zustand/react/shallow";

import { useQueueUploadItemsStore } from "../../stores/queues-upload-item-store";

export const QueueUploadItemsDialogWrapper = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) => {
  // Get alert dialog store state
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );

  const { showDialog, isProcessing, setShowDialog } = useQueueUploadItemsStore(
    useShallow((state) => ({
      showDialog: state.showDialog,
      isProcessing: state.isProcessing,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Get show discard changes alert dialog handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  return (
    <DialogPrimitive.Root
      open={showDialog}
      onOpenChange={() => {
        // Return if alert dialog is open
        if (isAlertDialogOpen) return;

        // If form is dirty, show alert dialog
        if (isProcessing) {
          showDefaultAlertDialog({
            confirmActionFn: () => setShowDialog(!showDialog),
            alertType: "unsaved",
          });
        }
        // Toggle dialog open state
        else {
          setShowDialog(!showDialog);
        }
      }}
      {...props}
    />
  );
};

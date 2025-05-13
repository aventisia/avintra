import {
  DialogContent,
  DialogDefaultHeader,
  DialogWrapper,
} from "@aventisia/ui/dialog";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { ScrollArea } from "@aventisia/ui/scroll";
import { useAlertDialogStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { useQueueDTCrudDialogStore } from "../../../stores/queue-dialog-store";

import { QueueAssignAgentForm } from "./QueueAssignAgentForm";

export const QueueAssignAgentDialog = ({
  children,
}: React.PropsWithChildren) => {
  // Get alert dialog store state
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );

  // Get crud dialog store to show dialog state
  const {
    crudDialogOptions: { showDialog },
    isFormDirty,
    dialogHeading,
    setShowDialog,
  } = useQueueDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      isFormDirty: state.isFormDirty,
      dialogHeading: state.dialogHeading,
      setShowDialog: state.setShowDialog,
    })),
  );

  // Get show discard changes alert dialog handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Return dialog
  return (
    <DialogWrapper
      open={showDialog}
      onOpenChangeFn={() => {
        // Return if alert dialog is open
        if (isAlertDialogOpen) return;

        // If form is dirty, show alert dialog
        if (isFormDirty) {
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
    >
      {children}
      <DialogContent side={"right"} className="!max-w-[38rem]">
        <DialogDefaultHeader heading={dialogHeading} />
        <ScrollArea className="h-[calc(100vh-4rem)] px-2.5 pb-0 pt-4">
          <QueueAssignAgentForm />
        </ScrollArea>
      </DialogContent>
    </DialogWrapper>
  );
};

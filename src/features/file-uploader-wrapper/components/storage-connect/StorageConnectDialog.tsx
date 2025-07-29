import {
  DialogContent,
  DialogDefaultHeader,
  DialogWrapper,
} from "@aventisia/ui/dialog";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useAlertDialogStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { useToggleCredentailsDialogStore } from "../../store/toggle-add-credentials-store";
import StorageConnectForm from "./StorageConnectForm";

const StorageConnectDialog = ({ children }: React.PropsWithChildren) => {
  const {
    setShowAddCredentailsDialog,
    showAddCredentailsDialog,
    cloudServiceName,
    isFormDirty,
  } = useToggleCredentailsDialogStore();
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );
  const { showDefaultAlertDialog } = useShowAlertHandler();

  return (
    <DialogWrapper
      open={showAddCredentailsDialog}
      onOpenChangeFn={() => {
        // Return if alert dialog is open
        if (isAlertDialogOpen) return;

        // If form is dirty, show alert dialog
        if (isFormDirty) {
          showDefaultAlertDialog({
            confirmActionFn: () =>
              setShowAddCredentailsDialog(!showAddCredentailsDialog),
            alertType: "unsaved",
          });
        }
        // Toggle dialog open state
        else {
          setShowAddCredentailsDialog(!showAddCredentailsDialog);
        }
      }}
    >
      {children}
      <DialogContent side="right" className="!max-w-[35vw]">
        <DialogDefaultHeader
          className="px-3.5 py-3 text-lg tracking-wide"
          heading={`Connect with ${cloudServiceName}`}
        />
        <StorageConnectForm />
      </DialogContent>
    </DialogWrapper>
  );
};

export default StorageConnectDialog;

import {
  DialogContent,
  DialogDefaultHeader,
  DialogWrapper,
} from "@aventisia/ui/dialog";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useAlertDialogStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { useToggleCreateNewCredentialsDialogStore } from "../store/toggle-add-credentials-store";
import CreateNewCredentialsForm from "./CreateNewCredentialsForm";

const CreateNewCredentialsDialog = ({ children }: React.PropsWithChildren) => {
  const {
    setShowCreateNewCredentialsDialog,
    showCreateNewCredentialsDialog,
    isFormDirty,
  } = useToggleCreateNewCredentialsDialogStore();
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );
  const { showDefaultAlertDialog } = useShowAlertHandler();

  return (
    <DialogWrapper
      open={showCreateNewCredentialsDialog}
      onOpenChangeFn={() => {
        // Return if alert dialog is open
        if (isAlertDialogOpen) return;

        // If form is dirty, show alert dialog
        if (isFormDirty) {
          showDefaultAlertDialog({
            confirmActionFn: () =>
              setShowCreateNewCredentialsDialog(
                !showCreateNewCredentialsDialog,
              ),
            alertType: "unsaved",
          });
        }
        // Toggle dialog open state
        else {
          setShowCreateNewCredentialsDialog(!showCreateNewCredentialsDialog);
        }
      }}
    >
      {children}
      <DialogContent side="right" className="!max-w-[35vw]">
        <DialogDefaultHeader
          className="px-3.5 py-3 text-lg tracking-wide"
          heading="Create New Credential"
        />
        <CreateNewCredentialsForm />
      </DialogContent>
    </DialogWrapper>
  );
};

export default CreateNewCredentialsDialog;

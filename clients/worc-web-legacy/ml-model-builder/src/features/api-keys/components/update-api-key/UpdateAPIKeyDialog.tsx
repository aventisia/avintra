import { Separator } from "@aventisia/ui";
import {
  DialogContent,
  DialogDefaultHeader,
  DialogWrapper,
} from "@aventisia/ui/dialog";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useAlertDialogStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { useUpdateApiKeyDialogStore } from "../../store/update-api-key-dialog-store";
import UpdateAPIKeyForm from "./UpdateAPIKeyForm";

const UpdateAPIKeyDialog = ({ children }: React.PropsWithChildren) => {
  const { isOpen, setOpen, isFormDirty } = useUpdateApiKeyDialogStore();
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );
  const { showDefaultAlertDialog } = useShowAlertHandler();

  return (
    <DialogWrapper
      open={isOpen}
      onOpenChangeFn={() => {
        // Return if alert dialog is open
        if (isAlertDialogOpen) return;

        // If form is dirty, show alert dialog
        if (isFormDirty) {
          showDefaultAlertDialog({
            confirmActionFn: () => setOpen(!isOpen),
            alertType: "unsaved",
          });
        }
        // Toggle dialog open state
        else {
          setOpen(!isOpen);
        }
      }}
    >
      {children}
      <DialogContent side={"right"} className="!max-w-[35vw]">
        <DialogDefaultHeader
          className="px-3.5 py-3 text-lg tracking-wide"
          heading="Update API Key"
        />
        <Separator />
        <UpdateAPIKeyForm />
      </DialogContent>
    </DialogWrapper>
  );
};

export default UpdateAPIKeyDialog;

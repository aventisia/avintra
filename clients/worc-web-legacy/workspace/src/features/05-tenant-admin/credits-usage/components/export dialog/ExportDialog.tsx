import {
  DialogContent,
  DialogDefaultHeader,
  DialogWrapper,
} from "@aventisia/ui/dialog";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useAlertDialogStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { useExportDialogStore } from "../../store/export-dialog-store";

import ExportDialogForm from "./ExportDialogForm";

const ExportDialog = ({ children }: React.PropsWithChildren) => {
  const { isOpen, setOpen, isFormDirty } = useExportDialogStore();
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
      <DialogContent className="!max-w-[35rem] space-y-2 px-1" side={"right"}>
        <DialogDefaultHeader
          heading="Export"
          className="px-3.5 py-3 text-lg tracking-wide"
        />
        <ExportDialogForm />
      </DialogContent>
    </DialogWrapper>
  );
};

export default ExportDialog;

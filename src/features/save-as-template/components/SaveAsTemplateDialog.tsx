// import { Separator } from "@aventisia/ui";
import {
  DialogContent,
  DialogDefaultHeader,
  // DialogHeader,
  // DialogTitle,
  DialogWrapper,
} from "@aventisia/ui/dialog";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { useAlertDialogStore } from "@aventisia/ui/stores";
import { useShallow } from "zustand/react/shallow";

import { useSaveAsTemplateDialogStore } from "../store/useSaveAsTemplateDialog";
import SaveAsTemplateForm from "./SaveAsTemplateForm";

const SaveAsTemplateDialog = ({ children }: React.PropsWithChildren) => {
  const { isOpen, setOpen, isFormDirty } = useSaveAsTemplateDialogStore();
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );
  const { showDefaultAlertDialog } = useShowAlertHandler();

  return (
    <>
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
        <DialogContent className="max-w-2xl w-full">
          <DialogDefaultHeader
            className="px-3.5 py-3 text-lg tracking-wide"
            heading="Save as Template"
          />
          <SaveAsTemplateForm />
        </DialogContent>
      </DialogWrapper>
    </>
  );
};

export default SaveAsTemplateDialog;

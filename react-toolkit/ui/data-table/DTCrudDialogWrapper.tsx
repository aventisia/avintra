import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { useAlertDialogStore } from "@/react-toolkit/stores/alert-dialog-store";
import { useDTCrudDialogStore } from "@/react-toolkit/stores/dt-crud-dialog-store";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useShallow } from "zustand/react/shallow";

type DTCrudDialogWrapperProps = React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>

/**
 * Wrapper component for a CRUD dialog which support alert-dialog and form dirty check.
 */
const DTCrudDialogWrapper = ({ ...props }: DTCrudDialogWrapperProps) => {
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
    setShowDialog,
  } = useDTCrudDialogStore(
    useShallow((state) => ({
      crudDialogOptions: state.crudDialogOptions,
      isFormDirty: state.isFormDirty,
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
      {...props}
    />
  );
};

DTCrudDialogWrapper.displayName = DialogPrimitive.Root.displayName;

export { DTCrudDialogWrapper };

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useShowAlertHandler } from "@/ui/hooks";
import { useAlertDialogStore, useDTCrudDialogStore } from "@/ui/stores";

import { useDataTableQueryParams } from ".";

/**
 * Wrapper component for a CRUD dialog which support alert-dialog and form dirty check.
 */
const DTCrudDialogWrapper = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) => {
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

  // Track previous showDialog state
  const prevShowDialog = useRef(showDialog);

  // Get show discard changes alert dialog handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  // Get clear CRUD params function
  const { clearCrudParams } = useDataTableQueryParams();

  // If dialog was open and is now closed, clear params
  useEffect(() => {
    if (prevShowDialog.current && !showDialog) {
      clearCrudParams();
    }
    prevShowDialog.current = showDialog;
  }, [showDialog, clearCrudParams]);

  return (
    <DialogPrimitive.Root
      open={showDialog}
      onOpenChange={(open) => {
        // Return if alert dialog is open
        if (isAlertDialogOpen) return;

        // If form is dirty, show alert dialog
        if (isFormDirty) {
          showDefaultAlertDialog({
            confirmActionFn: () => setShowDialog(false),
            alertType: "unsaved",
          });
        } else {
          // Toggle dialog open state
          setShowDialog(open);
        }
      }}
      {...props}
    />
  );
};

DTCrudDialogWrapper.displayName = DialogPrimitive.Root.displayName;

export { DTCrudDialogWrapper };

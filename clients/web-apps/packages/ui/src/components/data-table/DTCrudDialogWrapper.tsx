import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEffect, useRef } from "react";
import { useShallow } from "zustand/react/shallow";

import { useShowAlertHandler } from "@/ui/hooks";
import { useAlertDialogStore, useDTCrudDialogStore } from "@/ui/stores";

/**
 * Wraps Radix Dialog.Root and connects it to the DTCrudDialogStore.
 * When the dialog closes while the form is dirty, an "unsaved changes"
 * alert is shown before actually closing.
 */
export const DTCrudDialogWrapper = ({
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root>) => {
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({ isAlertDialogOpen: state.isAlertDialogOpen })),
  );

  const { showDialog, isFormDirty, setShowDialog } = useDTCrudDialogStore(
    useShallow((state) => ({
      showDialog: state.crudDialogOptions.showDialog,
      isFormDirty: state.isFormDirty,
      setShowDialog: state.setShowDialog,
    })),
  );

  const { showDefaultAlertDialog } = useShowAlertHandler();
  const prevOpen = useRef(showDialog);

  useEffect(() => {
    if (prevOpen.current && !showDialog) {
      // Dialog was closed — no extra cleanup needed here
    }
    prevOpen.current = showDialog;
  }, [showDialog]);

  return (
    <DialogPrimitive.Root
      open={showDialog}
      onOpenChange={(open) => {
        if (isAlertDialogOpen) return;
        if (!open && isFormDirty) {
          showDefaultAlertDialog({
            confirmActionFn: () => setShowDialog(false),
            alertType: "unsaved",
          });
        } else {
          setShowDialog(open);
        }
      }}
      {...props}
    />
  );
};
DTCrudDialogWrapper.displayName = "DTCrudDialogWrapper";

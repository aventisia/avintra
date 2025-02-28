import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { useAlertDialogStore } from "@/react-toolkit/stores/alert-dialog-store";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useShallow } from "zustand/react/shallow";
import { useMachineAssignmentStore } from "../../store/machine-assignment-store";

interface MachineAssignmentDialogWrapperProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {}

/**
 * Wrapper component for a machine assingment dialog which support alert-dialog and form dirty check.
 */
const MachineAssignmentDialogWrapper = ({
  ...props
}: MachineAssignmentDialogWrapperProps) => {
  // Get alert dialog store state
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );

  // Get machine assingment dialog store to show dialog state
  const { isFormDirty, setShowDialog, showDialog } = useMachineAssignmentStore(
    useShallow((state) => ({
      isFormDirty: state.isFormDirty,
      setShowDialog: state.setIsDialogOpen,
      showDialog: state.isDialogOpen,
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

MachineAssignmentDialogWrapper.displayName = DialogPrimitive.Root.displayName;

export { MachineAssignmentDialogWrapper };

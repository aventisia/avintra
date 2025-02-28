import { useShowAlertHandler } from "@/react-toolkit/hooks/useShowAlertHandler";
import { useAlertDialogStore } from "@/react-toolkit/stores/alert-dialog-store";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useShallow } from "zustand/react/shallow";
import { useMachineFlowStore } from "../../store/machine-flow-store";

interface MachineFlowDialogWrapperProps
  extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {}

/**
 * Wrapper component for a CRUD dialog which support alert-dialog and form dirty check.
 */
const MachineFlowDialogWrapper = ({
  ...props
}: MachineFlowDialogWrapperProps) => {
  // Get alert dialog store state
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );

  // Get crud dialog store to show dialog state
  const { isFormDirty, setIsDialogOpen, isDialogOpen } = useMachineFlowStore(
    useShallow((state) => ({
      isFormDirty: state.isFormDirty,
      setIsDialogOpen: state.setIsDialogOpen,
      isDialogOpen: state.isDialogOpen,
    })),
  );

  // Get show discard changes alert dialog handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  return (
    <DialogPrimitive.Root
      open={isDialogOpen}
      onOpenChange={() => {
        // Return if alert dialog is open
        if (isAlertDialogOpen) return;

        // If form is dirty, show alert dialog
        if (isFormDirty) {
          showDefaultAlertDialog({
            confirmActionFn: () => setIsDialogOpen(!isDialogOpen),
            alertType: "unsaved",
          });
        }
        // Toggle dialog open state
        else {
          setIsDialogOpen(!isDialogOpen);
        }
      }}
      {...props}
    />
  );
};

MachineFlowDialogWrapper.displayName = DialogPrimitive.Root.displayName;

export { MachineFlowDialogWrapper };

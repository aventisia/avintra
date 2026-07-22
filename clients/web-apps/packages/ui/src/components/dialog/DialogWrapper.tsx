import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useShallow } from "zustand/react/shallow";

import { useShowAlertHandler } from "@/ui/hooks";
import { useAlertDialogStore } from "@/ui/stores";

interface DialogWrapperProps extends React.ComponentPropsWithoutRef<typeof DialogPrimitive.Root> {
  onOpenChangeFn: () => void;
  isFormDirty?: boolean;
}

/**
 * Wrapper component for a dialog which support alert dialog and form dirty check.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onOpenChangeFn - Callback function to handle the change in dialog open state.
 * @param {boolean} props.isFormDirty - Indicates whether the form inside the dialog is dirty or not.
 * @returns {JSX.Element} The rendered DialogWrapper component.
 */
const DialogWrapper = ({ onOpenChangeFn, isFormDirty, ...props }: DialogWrapperProps) => {
  // Get alert dialog store state
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );

  // Get show unsaved changes alert dialog handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  return (
    <DialogPrimitive.Root
      onOpenChange={() => {
        // Return if alert dialog is open
        if (isAlertDialogOpen) return;

        // If form is dirty, show alert dialog
        if (isFormDirty) {
          showDefaultAlertDialog({
            confirmActionFn: () => onOpenChangeFn(),
            alertType: "unsaved",
          });
        }

        // Toggle dialog open state
        else {
          onOpenChangeFn();
        }
      }}
      {...props}
    />
  );
};

DialogWrapper.displayName = DialogPrimitive.Root.displayName;

export { DialogWrapper };

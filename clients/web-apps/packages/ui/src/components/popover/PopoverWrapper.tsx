import * as PopoverPrimitive from "@radix-ui/react-popover";
import { useShallow } from "zustand/react/shallow";

import { useShowAlertHandler } from "@/ui/hooks";
import { useAlertDialogStore } from "@/ui/stores";

interface PopoverWrapperProps extends React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Root> {
  onOpenChangeFn: () => void;
  isFormDirty?: boolean;
}

/**
 * Wrapper component for a popover which support alert-dialog and form dirty check.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {Function} props.onOpenChangeFn - Callback function to handle the change in popover open state.
 * @param {boolean} props.isFormDirty - Indicates whether the form inside the popover is dirty or not.
 * @returns {JSX.Element} The rendered PopoverWrapper component.
 */
const PopoverWrapper = ({ onOpenChangeFn, isFormDirty, ...props }: PopoverWrapperProps) => {
  // Get alert dialog store state
  const { isAlertDialogOpen } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
    })),
  );

  // Get show unsaved changes alert dialog handler
  const { showDefaultAlertDialog } = useShowAlertHandler();

  return (
    <PopoverPrimitive.Root
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

        // Toggle popover open state
        else {
          onOpenChangeFn();
        }
      }}
      {...props}
    />
  );
};

PopoverWrapper.displayName = PopoverPrimitive.Root.displayName;

export { PopoverWrapper };

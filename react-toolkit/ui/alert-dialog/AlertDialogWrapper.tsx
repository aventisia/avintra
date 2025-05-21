import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/react-toolkit/ui/alert-dialog";
import { useAlertDialogStore } from "@aventisia/ui/stores";
import { buttonVariants } from "@/react-toolkit/ui/buttons/button-variants";
import { useShallow } from "zustand/react/shallow";

/**
 * Wrapper component for the alert dialog.
 * This component wraps the main app to show the alert dialog.
 */
export const AlertDialogWrapper: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  // Get alert dialog store state
  const {
    isAlertDialogOpen,
    toggleAlertDialogOpen,
    confirmActionFn,
    isDestructive,
    title,
    description,
    cancelBtnText,
    confirmBtnText,
  } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
      toggleAlertDialogOpen: state.toggleAlertDialogOpen,
      confirmActionFn: state.confirmActionFn,
      isDestructive: state.isDestructive,
      title: state.title,
      description: state.description,
      cancelBtnText: state.cancelBtnText,
      confirmBtnText: state.confirmBtnText,
    })),
  );

  // Return wrapper
  return (
    // Alert dialog provider/root
    <AlertDialog
      open={isAlertDialogOpen}
      onOpenChange={() => toggleAlertDialogOpen(!isAlertDialogOpen)}
    >
      {/* Main app */}
      {children}

      {/* Custom alert dialog to confirm action */}
      <AlertDialogContent>
        {/* Header */}
        <AlertDialogHeader>
          {/* Title */}
          <AlertDialogTitle>{title}</AlertDialogTitle>

          {/* Description */}
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          {/* Cancel button */}
          <AlertDialogCancel>{cancelBtnText}</AlertDialogCancel>

          {/* Continue button */}
          <AlertDialogAction
            className={buttonVariants(
              isDestructive
                ? { variant: "destructive" }
                : { variant: "default" },
            )}
            onClick={confirmActionFn}
          >
            {confirmBtnText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

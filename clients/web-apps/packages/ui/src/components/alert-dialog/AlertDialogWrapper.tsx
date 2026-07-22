import { useShallow } from "zustand/react/shallow";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/ui/components/alert-dialog";
import { buttonVariants } from "@/ui/components/buttons";
import { cn } from "@/ui/lib";
import { useAlertDialogStore } from "@/ui/stores";

/**
 * Wrapper component for the alert dialog.
 * This component wraps the main app to show the alert dialog.
 */
export const AlertDialogWrapper: React.FC<React.PropsWithChildren> = ({ children }) => {
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
          {cancelBtnText?.length ? <AlertDialogCancel>{cancelBtnText}</AlertDialogCancel> : null}

          {/* Continue button */}
          <AlertDialogAction
            className={cn(
              buttonVariants(isDestructive ? { variant: "destructive" } : { variant: "default" }),
              "min-w-24",
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

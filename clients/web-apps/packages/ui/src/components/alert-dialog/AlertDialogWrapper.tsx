import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { LoadingSpinner } from "@/ui/components/LoadingSpinner";
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
  const [isConfirmPending, setIsConfirmPending] = useState(false);

  // Get alert dialog store state
  const {
    isAlertDialogOpen,
    toggleAlertDialogOpen,
    confirmActionFn,
    isDestructive,
    title,
    description,
    content,
    cancelBtnText,
    confirmBtnText,
    showLoadingOnConfirm,
  } = useAlertDialogStore(
    useShallow((state) => ({
      isAlertDialogOpen: state.isAlertDialogOpen,
      toggleAlertDialogOpen: state.toggleAlertDialogOpen,
      confirmActionFn: state.confirmActionFn,
      isDestructive: state.isDestructive,
      title: state.title,
      description: state.description,
      content: state.content,
      cancelBtnText: state.cancelBtnText,
      confirmBtnText: state.confirmBtnText,
      showLoadingOnConfirm: state.showLoadingOnConfirm,
    })),
  );

  const handleConfirmAction = () => {
    if (isConfirmPending) return;

    const actionResult = confirmActionFn();
    if (!actionResult || typeof actionResult.then !== "function") {
      toggleAlertDialogOpen(false);
      return;
    }

    setIsConfirmPending(true);
    void Promise.resolve(actionResult)
      .then(() => toggleAlertDialogOpen(false))
      .catch(() => undefined)
      .finally(() => setIsConfirmPending(false));
  };

  // Return wrapper
  return (
    // Alert dialog provider/root
    <AlertDialog
      open={isAlertDialogOpen}
      onOpenChange={(open) => {
        if (!isConfirmPending) toggleAlertDialogOpen(open);
      }}
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

          {/* Custom content */}
          {content ? <div className="mt-4">{content}</div> : null}
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          {/* Cancel button */}
          {cancelBtnText?.length ? (
            <AlertDialogCancel disabled={isConfirmPending}>{cancelBtnText}</AlertDialogCancel>
          ) : null}

          {/* Continue button */}
          <AlertDialogAction
            className={cn(
              buttonVariants(isDestructive ? { variant: "destructive" } : { variant: "default" }),
              "min-w-24",
            )}
            disabled={showLoadingOnConfirm && isConfirmPending}
            onClick={(event) => {
              if (showLoadingOnConfirm) {
                event.preventDefault();
                handleConfirmAction();
              } else {
                confirmActionFn();
              }
            }}
          >
            {showLoadingOnConfirm && isConfirmPending ? (
              <LoadingSpinner className="mr-1 h-4 w-4" />
            ) : null}
            {confirmBtnText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

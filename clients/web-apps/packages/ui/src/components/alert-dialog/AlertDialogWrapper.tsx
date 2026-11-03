import { QuestionIcon, WarningIcon } from "@phosphor-icons/react";
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
import { IconTile } from "@/ui/components/icon-tile";
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

      <AlertDialogContent className="w-[min(28rem,calc(100vw-2rem))] max-w-none gap-0 overflow-hidden bg-popover p-0 ring-1 ring-line">
        <AlertDialogHeader className="flex-row items-start gap-4 space-y-0 px-6 pb-4 pt-6 text-left sm:text-left">
          <IconTile
            Icon={isDestructive ? WarningIcon : QuestionIcon}
            size="lg"
            className={cn(
              "size-12 rounded-lg [&>svg]:size-6",
              isDestructive ? "bg-bad/10 text-bad ring-bad/20" : "text-primary",
            )}
          />
          <div className="mt-1 min-w-0 flex-1">
            <p
              className={cn(
                "text-[11px] font-semibold uppercase tracking-[0.1em]",
                isDestructive ? "text-bad" : "text-primary",
              )}
            >
              Confirm
            </p>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
        </AlertDialogHeader>

        <div className="px-6 pb-5">
          <AlertDialogDescription className="text-[13px] leading-5 text-ink-2">
            {description}
          </AlertDialogDescription>
          {content ? <div className="mt-4">{content}</div> : null}
        </div>

        <AlertDialogFooter className="m-0 gap-2 bg-sunken/70 px-6 py-3.5">
          {cancelBtnText?.length ? (
            <AlertDialogCancel className="h-9" disabled={isConfirmPending}>
              {cancelBtnText}
            </AlertDialogCancel>
          ) : null}

          <AlertDialogAction
            className={cn(
              buttonVariants(isDestructive ? { variant: "destructive" } : { variant: "default" }),
              "h-9 min-w-24 px-4",
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

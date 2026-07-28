import React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@avplatform/ui/alert-dialog";
import { LoadingSpinner } from "@avplatform/ui";
import { Button } from "@avplatform/ui/buttons";

/**
 *  Confirmation dialog before importing the flow.
 */
interface ImportConfirmationDialogProps {
  open: boolean;

  isPending: boolean;
  onConfirm: () => void;
  onOpenChange?(open: boolean): void;
}

export const ImportConfirmationDialog: React.FC<
  ImportConfirmationDialogProps
> = ({ open, onOpenChange, isPending, onConfirm }) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Import Agent</AlertDialogTitle>
          <AlertDialogDescription>
            This will overwrite your current flow with the imported data. Are
            you sure you want to proceed?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {/* Cancel button */}
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          {/* Import button, shows loading spinner if the mutation is in progress */}
          <Button disabled={isPending} onClick={onConfirm}>
            {isPending ? (
              <>
                <LoadingSpinner className="mr-1 h-3 w-3 text-muted-foreground" />
                Importing
              </>
            ) : (
              "Import"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

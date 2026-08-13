import { buttonVariants } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { Trash2 } from "lucide-react";

import { useRemoveResourceShareMutation } from "../../hooks/useRemoveResourceShareMutation";

interface RemoveUserIconButtonProps {
  id: string;
}

/**
 * Renders a delete icon button to remove a user's access.
 * Used for Space resources where the access-level (View/Edit/Owner) actions
 * are not applicable, so only removal is exposed.
 */
export const RemoveUserIconButton = ({ id }: RemoveUserIconButtonProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  // Get mutation function to remove the resource share
  const { mutate } = useRemoveResourceShareMutation();

  return (
    <button
      type="button"
      aria-label="Remove access"
      className={cn(
        buttonVariants({ variant: "ghost", size: "icon8" }),
        "text-destructive hover:bg-destructive hover:text-white",
      )}
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () => mutate(id),
          title: "Remove Access",
          confirmBtnText: "Remove",
          description: "Are you sure you want to remove the access?",
        });
      }}
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
};

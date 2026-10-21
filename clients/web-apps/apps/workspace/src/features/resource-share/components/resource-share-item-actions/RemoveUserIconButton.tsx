import { Button } from "@avplatform/ui/buttons";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
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
    <Button
      type="button"
      variant="ghost"
      size="icon7"
      aria-label="Remove access"
      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
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
    </Button>
  );
};

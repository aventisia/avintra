import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { UserMinus2Icon } from "lucide-react";
import { cn } from "@avplatform/ui/lib";
import { buttonVariants } from "@avplatform/ui/buttons";
import { useRemoveUserMutation } from "@/features/share-access/hooks/useRemoveUserMutation";

interface RemoveUserActionProps {
  id: string;
}

/**
 * Renders the delete action for a flow list item.
 * This component displays a dropdown menu item with a delete button.
 */
export const RemoveUserAction = ({ id }: RemoveUserActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();
  const { mutate } = useRemoveUserMutation();
  // Return Delete alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownCautionItem" }),
        "group h-7 !px-[0.3rem] text-xs",
      )}
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () => {
            mutate(id);
          },
          title: "Remove User",
          confirmBtnText: "Remove",
          description:
            "Are you sure you want to remove this user's access to the Agent?",
        });
      }}
    >
      <UserMinus2Icon
        className={cn(
          "mb-[2px] text-destructive group-focus:text-white",
          "h-3.5 w-3.5",
        )}
      />
      Remove
    </DropdownMenuItem>
  );
};

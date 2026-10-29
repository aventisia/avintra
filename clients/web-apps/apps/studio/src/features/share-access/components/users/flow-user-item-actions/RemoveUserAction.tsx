import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { useShowAlertHandler } from "@avplatform/ui/hooks";
import { cn } from "@avplatform/ui/lib";
import { UserMinus2Icon } from "lucide-react";

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
        "group h-7 !px-[0.3rem] text-xs text-bad focus:bg-hover focus:text-bad data-[highlighted]:bg-hover data-[highlighted]:text-bad",
      )}
      onClick={() => {
        showCustomAlertDialog({
          confirmActionFn: () => {
            mutate(id);
          },
          title: "Remove user",
          confirmBtnText: "Remove",
          description: "Are you sure you want to remove this user's access to the Agent?",
        });
      }}
    >
      <UserMinus2Icon className={cn("mb-[2px] text-bad", "h-3.5 w-3.5")} />
      Remove
    </DropdownMenuItem>
  );
};

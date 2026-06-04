import { buttonVariants } from "@aventisia/ui/buttons";
import { DropdownMenuItem } from "@aventisia/ui/dropdown-menu";
import { useShowAlertHandler } from "@aventisia/ui/hooks";
import { cn } from "@aventisia/ui/lib";
import { UserMinus2Icon } from "lucide-react";

import { useRemoveResourceShareMutation } from "../../hooks/useRemoveResourceShareMutation";

interface RemoveUserActionProps {
  id: string;
}

/**
 * Renders a dropdown menu item for Remove user access in Resource Share.
 */
export const RemoveUserAction = ({ id }: RemoveUserActionProps) => {
  // Get showAlert handler
  const { showCustomAlertDialog } = useShowAlertHandler();

  const { mutate } = useRemoveResourceShareMutation();

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
          title: "Remove Access",
          confirmBtnText: "Remove",
          description: "Are you sure you want to remove the access?",
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

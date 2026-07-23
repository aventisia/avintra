import { buttonVariants } from "@avplatform/ui/buttons";
import { DropdownMenuItem } from "@avplatform/ui/dropdown-menu";
import { cn } from "@avplatform/ui/lib";
import { UserMinus2Icon } from "lucide-react";

import { useRemoveUserMutation } from "../../../hooks/user/useRemoveUserMutation";

interface RemoveUserActionProps {
  userId: string;
}

/**
 * Renders the delete action for a flow list item.
 * This component displays a dropdown menu item with a delete button.
 */
export const RemoveUserAction = ({ userId }: RemoveUserActionProps) => {
  const { mutate: removeUser } = useRemoveUserMutation();

  // Return Delete alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownCautionItem" }),
        "group h-7 !px-[0.3rem] text-xs",
      )}
      onClick={() => {
        removeUser(userId);
      }}
    >
      <UserMinus2Icon
        className={cn("mb-[2px] text-destructive group-focus:text-white", "h-3.5 w-3.5")}
      />
      Remove
    </DropdownMenuItem>
  );
};

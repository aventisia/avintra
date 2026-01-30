import { buttonVariants } from "@aventisia/ui/buttons";
import { DropdownMenuItem } from "@aventisia/ui/dropdown-menu";
import { cn } from "@aventisia/ui/lib";
import { TrashIcon } from "@heroicons/react/24/outline";

import { useRemoveUserMutation } from "../../../hooks/useRemoveUserMutation";

interface RemoveUserActionProps {
  agentId: string;
}

/**
 * Renders the delete action for a flow list item.
 * This component displays a dropdown menu item with a delete button.
 */
export const RemoveUserAction = ({ agentId }: RemoveUserActionProps) => {
  const { mutate: removeUser } = useRemoveUserMutation();

  // Return Delete alert dialog trigger
  return (
    <DropdownMenuItem
      className={cn(
        buttonVariants({ variant: "dropdownCautionItem" }),
        "group h-8",
      )}
      onClick={() => {
        removeUser(agentId);
      }}
    >
      <TrashIcon
        className={cn(
          "mb-[2px] text-destructive group-focus:text-white",
          "h-4 w-4",
        )}
      />
      Remove
    </DropdownMenuItem>
  );
};

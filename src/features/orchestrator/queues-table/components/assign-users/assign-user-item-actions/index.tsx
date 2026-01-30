import { DropdownMenuContent } from "@aventisia/ui/dropdown-menu";
import { DropdownMenu } from "@aventisia/ui/dropdown-menu";

import { RemoveUserAction } from "./RemoveUserAction";
import { UsersActionsTrigger } from "./UsersActionsTrigger";

interface UsersListItemActionsProps {
  id: string;
}

/**
 * Renders the actions dropdown menu for a flow list item in the flows list.
 */
export const UsersListItemActions = ({ id }: UsersListItemActionsProps) => {
  return (
    // Dropdown menu for flow table row action
    <DropdownMenu>
      {/* Trigger for dropdown menu */}
      <UsersActionsTrigger />

      {/* Dropdown menu content */}
      <DropdownMenuContent align="end" className="w-[6rem] min-w-[6rem]">
        <RemoveUserAction agentId={id} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

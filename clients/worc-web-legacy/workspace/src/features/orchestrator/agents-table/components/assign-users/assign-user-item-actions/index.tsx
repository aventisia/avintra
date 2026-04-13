import { DropdownMenuContent } from "@aventisia/ui/dropdown-menu";
import { DropdownMenu } from "@aventisia/ui/dropdown-menu";

import { ChatAgentUserDto } from "../../../dtos/chat-agent-users-dto";
import { RemoveUserAction } from "./RemoveUserAction";
import { UsersActionsTrigger } from "./UsersActionsTrigger";

interface UsersListItemActionsProps {
  item: ChatAgentUserDto;
}

/**
 * Renders the actions dropdown menu for a flow list item in the flows list.
 */
export const UsersListItemActions = ({ item }: UsersListItemActionsProps) => {
  return (
    // Dropdown menu for flow table row action
    <DropdownMenu>
      {/* Trigger for dropdown menu */}
      <UsersActionsTrigger />

      {/* Dropdown menu content */}
      <DropdownMenuContent align="end" className="w-[8rem] min-w-[8rem]">
        <RemoveUserAction userId={item.id ?? ""} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

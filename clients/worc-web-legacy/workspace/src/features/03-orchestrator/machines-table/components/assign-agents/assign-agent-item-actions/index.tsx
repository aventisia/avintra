import { DropdownMenuContent } from "@aventisia/ui/dropdown-menu";
import { DropdownMenu } from "@aventisia/ui/dropdown-menu";

import { AgentsActionsTrigger } from "./AgentsActionsTrigger";
import { AgentsDeleteAction } from "./AgentsDeleteAction";

interface AgentsListItemActionsProps {
  id: string;
}

/**
 * Renders the actions dropdown menu for a flow list item in the flows list.
 */
export const AgentsListItemActions = ({ id }: AgentsListItemActionsProps) => {
  return (
    // Dropdown menu for flow table row action
    <DropdownMenu>
      {/* Trigger for dropdown menu */}
      <AgentsActionsTrigger />

      {/* Dropdown menu content */}
      <DropdownMenuContent align="end" className="w-[6rem] min-w-[6rem]">
        <AgentsDeleteAction agentId={id} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

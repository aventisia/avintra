import { DTRowActionStore } from "@avplatform/ui/data-table";
import { DropdownMenuContent, DropdownMenuSeparator } from "@avplatform/ui/dropdown-menu";
import { DropdownMenu } from "@avplatform/ui/dropdown-menu";

import { FLIActionsTrigger } from "./FLIActionsTrigger";
import { FLIDeleteAction } from "./FLIDeleteAction";
import { FLIOpenAction } from "./FLIOpenAction";

interface FlowListItemActionsProps {
  flowId: string;
}

/**
 * Renders the actions dropdown menu for a flow list item in the flows list.
 */
export const FlowListItemActions = ({ flowId }: FlowListItemActionsProps) => {
  return (
    // Dropdown menu for flow table row action
    <DropdownMenu>
      {/* Trigger for dropdown menu */}
      <FLIActionsTrigger />

      {/* Dropdown menu content */}
      <DropdownMenuContent align="end" className="w-[6rem] min-w-[6rem]">
        {/* To open flow in studio */}
        <FLIOpenAction flowId={flowId} />

        {/* Opens crud dialog to view the flow details */}
        <DTRowActionStore rowId={flowId} crudAction="read" size="sm" />

        {/* Opens crud dialog to update flow details */}
        <DTRowActionStore rowId={flowId} crudAction="update" size="sm" />

        {/* DropdownMenuSeparator component */}
        <DropdownMenuSeparator />

        {/* Triggers Agent delete alert dialog  */}
        <FLIDeleteAction flowId={flowId} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

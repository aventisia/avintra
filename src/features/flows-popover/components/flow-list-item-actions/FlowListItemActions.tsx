import { DTRowAction } from "@/react-toolkit/ui/data-table/row-actions/DTRowAction";
import {
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@/react-toolkit/ui/drop-down/dropdown-menu";
import { DropdownMenu } from "@/react-toolkit/ui/drop-down/DropdownMenu";
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
        <DTRowAction rowId={flowId} crudAction="read" size="sm" />

        {/* Opens crud dialog to update flow details */}
        <DTRowAction rowId={flowId} crudAction="update" size="sm" />

        {/* DropdownMenuSeparator component */}
        <DropdownMenuSeparator />

        {/* Triggers Flow delete alert dialog  */}
        <FLIDeleteAction flowId={flowId} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

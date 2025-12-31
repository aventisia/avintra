import {
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@aventisia/ui/dropdown-menu";
import { DropdownMenu } from "@aventisia/ui/dropdown-menu";
import { AAIOpenAction } from "./AAIOpenAction";
import { AAIActionsTrigger } from "./AAIActionsTrigger";
import { AAIDeleteAction } from "./AAIDeleteAction";

interface AAListItemActionsProps {
  flowId: string;
  versionId: string;
}

/**
 * Renders the actions dropdown menu for a flow list item in the flows list.
 */
export const AAListItemActions = ({
  flowId,
  versionId,
}: AAListItemActionsProps) => {
  return (
    // Dropdown menu for flow table row action
    <DropdownMenu>
      {/* Trigger for dropdown menu */}
      <AAIActionsTrigger />

      {/* Dropdown menu content */}
      <DropdownMenuContent align="end" className="w-[6rem] min-w-[6rem]">
        {/* To open flow in studio */}
        <AAIOpenAction flowId={flowId} versionId={versionId} />

        {/* DropdownMenuSeparator component */}
        <DropdownMenuSeparator />

        {/* Triggers Agent delete alert dialog  */}
        <AAIDeleteAction flowId={flowId} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

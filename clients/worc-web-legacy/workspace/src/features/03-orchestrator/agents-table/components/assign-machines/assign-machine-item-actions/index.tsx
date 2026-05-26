import { DropdownMenuContent } from "@aventisia/ui/dropdown-menu";
import { DropdownMenu } from "@aventisia/ui/dropdown-menu";

import { MachinesActionsTrigger } from "./MachinesActionsTrigger";
import { MachinesDeleteAction } from "./MachinesDeleteAction";

interface MachinesListItemActionsProps {
  id: string;
}

/**
 * Renders the actions dropdown menu for a flow list item in the flows list.
 */
export const MachinesListItemActions = ({
  id,
}: MachinesListItemActionsProps) => {
  return (
    // Dropdown menu for flow table row action
    <DropdownMenu>
      {/* Trigger for dropdown menu */}
      <MachinesActionsTrigger />

      {/* Dropdown menu content */}
      <DropdownMenuContent align="end" className="w-[6rem] min-w-[6rem]">
        <MachinesDeleteAction id={id} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

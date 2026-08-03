import { DropdownMenuContent } from "@avplatform/ui/dropdown-menu";
import { DropdownMenu } from "@avplatform/ui/dropdown-menu";

import { FlowUserDto } from "@/features/share-access/dtos/flow-user-dto";

import { CanEditAction } from "./CanEditAction";
import { CanViewAction } from "./CanViewAction";
import { FUActionsTrigger } from "./FUActionsTrigger";
import { MarkAsOwnerAction } from "./MarkAsOwnerAction";
import { RemoveUserAction } from "./RemoveUserAction";

interface FlowUserItemActionsProps {
  item: FlowUserDto;
}

/**
 * Renders the actions dropdown menu for a flow user item in the users list.
 */
export const FlowUserItemActions = ({ item }: FlowUserItemActionsProps) => {
  return (
    <DropdownMenu>
      {/* Trigger for dropdown menu */}
      <FUActionsTrigger />

      {/* Dropdown menu content */}
      <DropdownMenuContent align="end" className="w-[8rem] min-w-[8rem]">
        {item.type !== "Edit" ? <CanEditAction item={item} /> : null}{" "}
        {item.type !== "View" ? <CanViewAction item={item} /> : null}{" "}
        {item.type !== "Owner" ? <MarkAsOwnerAction item={item} /> : null}{" "}
        <RemoveUserAction id={item.id || ""} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

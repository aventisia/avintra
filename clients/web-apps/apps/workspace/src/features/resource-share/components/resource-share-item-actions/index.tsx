import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
} from "@avplatform/ui/dropdown-menu";

import { ResourceShareDto } from "../../dtos/resource-share-dto";
// import { CanDeleteAction } from "./CanDeleteAction";
import { CanEditAction } from "./CanEditAction";
import { CanViewAction } from "./CanViewAction";
// import { FullAccessAction } from "./FullAccessAction";
import { MarkAsOwnerAction } from "./MarkAsOwnerAction";
import { RemoveUserAction } from "./RemoveUserAction";
import { ResourceShareActionsTrigger } from "./ResourceShareActionsTrigger";

interface ResourceShareItemActionsProps {
  item: ResourceShareDto;
}

/**
 * Renders the actions dropdown menu for a Resource Share item in the users list.
 */
export const ResourceShareItemActions = ({ item }: ResourceShareItemActionsProps) => {
  return (
    <DropdownMenu>
      {/* Trigger for dropdown menu */}
      <ResourceShareActionsTrigger />

      {/* Dropdown menu content */}
      <DropdownMenuContent align="end" className="w-[8rem] min-w-[8rem]">
        {item.accessLevel !== "Edit" ? <CanEditAction item={item} /> : null}

        {item.accessLevel !== "View" ? <CanViewAction item={item} /> : null}

        {item.accessLevel !== "Owner" ? <MarkAsOwnerAction item={item} /> : null}

        {/* {item.accessLevel !== "FullAccess" ? (
          <FullAccessAction item={item} />
        ) : null} */}

        {/* {item.accessLevel !== "Delete" ? <CanDeleteAction item={item} /> : null} */}

        <DropdownMenuSeparator />

        <RemoveUserAction id={item.id || ""} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

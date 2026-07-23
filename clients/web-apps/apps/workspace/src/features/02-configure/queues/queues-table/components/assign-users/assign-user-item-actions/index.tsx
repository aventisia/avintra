import { DropdownMenuContent } from "@avplatform/ui/dropdown-menu";
import { DropdownMenu } from "@avplatform/ui/dropdown-menu";

import { QueueUserDto } from "../../../dtos/queue-users-dto";
import { QueueWorkItemAccessTypesEnum } from "../../../enums/queue-work-item-access-enum";
import { AccessAction } from "./AccessAction";
import { RemoveUserAction } from "./RemoveUserAction";
import { UsersActionsTrigger } from "./UsersActionsTrigger";

interface UsersListItemActionsProps {
  item: QueueUserDto;
}

/**
 * Renders the actions dropdown menu for a flow list item in the flows list.
 */
export const UsersListItemActions = ({ item }: UsersListItemActionsProps) => {
  const ACCESS_TYPES = Object.values(QueueWorkItemAccessTypesEnum);

  return (
    // Dropdown menu for flow table row action
    <DropdownMenu>
      {/* Trigger for dropdown menu */}
      <UsersActionsTrigger />

      {/* Dropdown menu content */}
      <DropdownMenuContent align="end" className="w-[8rem] min-w-[8rem]">
        {ACCESS_TYPES.filter((type) => type !== item.accessType).map((type) => (
          <AccessAction key={type} item={item} accessType={type} />
        ))}{" "}
        <RemoveUserAction userId={item.id ?? ""} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

import { DropdownMenuContent } from "@avplatform/ui/dropdown-menu";
import { DropdownMenu } from "@avplatform/ui/dropdown-menu";

import { QueueAgentsDto } from "../../../dtos/queue-agents-dto";
import { QueueWorkItemAccessTypesEnum } from "../../../enums/queue-work-item-access-enum";
import { AccessAction } from "./AccessAction";
import { AgentsActionsTrigger } from "./AgentsActionsTrigger";
import { RemoveAgentAction } from "./RemoveAgentAction";

interface AgentsListItemActionsProps {
  item: QueueAgentsDto;
}

/**
 * Renders the actions dropdown menu for a flow list item in the flows list.
 */
export const AgentsListItemActions = ({ item }: AgentsListItemActionsProps) => {
  const ACCESS_TYPES = Object.values(QueueWorkItemAccessTypesEnum);

  return (
    // Dropdown menu for flow table row action
    <DropdownMenu>
      {/* Trigger for dropdown menu */}
      <AgentsActionsTrigger />

      {/* Dropdown menu content */}
      <DropdownMenuContent align="end" className="w-[8rem] min-w-[8rem]">
        {ACCESS_TYPES.filter((type) => type !== item.accessType).map((type) => (
          <AccessAction key={type} item={item} accessType={type} />
        ))}{" "}
        <RemoveAgentAction agentId={item.id ?? ""} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

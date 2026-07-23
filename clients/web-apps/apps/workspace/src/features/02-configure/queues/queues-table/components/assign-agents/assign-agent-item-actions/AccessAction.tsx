import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";

import { ACCESS_MENU_CONFIG } from "../../../constants/access-config";
import { QueueAgentsDto } from "../../../dtos/queue-agents-dto";
import { QueueWorkItemAccessTypesEnum } from "../../../enums/queue-work-item-access-enum";
import { useUpdateAgentMutation } from "../../../hooks/useUpdateAgentMutation";

interface AccessActionProps {
  item: QueueAgentsDto;
  accessType: QueueWorkItemAccessTypesEnum;
}

export const AccessAction = ({ item, accessType }: AccessActionProps) => {
  const { mutate } = useUpdateAgentMutation();

  const handleClick = () => {
    mutate({
      ...item,
      accessType,
    });
  };

  const config = ACCESS_MENU_CONFIG[accessType];

  return (
    <SimpleDDMenuItem onClick={handleClick} size="sm" content={config.label} Icon={config.Icon} />
  );
};

import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";

import { ACCESS_MENU_CONFIG } from "../../../constants/access-config";
import { QueueUserDto } from "../../../dtos/queue-users-dto";
import { QueueWorkItemAccessTypesEnum } from "../../../enums/queue-work-item-access-enum";
import { useUpdateUserMutation } from "../../../hooks/useUpdateUserMutation";

interface AccessActionProps {
  item: QueueUserDto;
  accessType: QueueWorkItemAccessTypesEnum;
}

export const AccessAction = ({ item, accessType }: AccessActionProps) => {
  const { mutate } = useUpdateUserMutation();

  const handleClick = () => {
    mutate({
      ...item,
      accessType,
    });
  };

  const config = ACCESS_MENU_CONFIG[accessType];

  return (
    <SimpleDDMenuItem
      onClick={handleClick}
      size="sm"
      content={config.label}
      Icon={config.Icon}
    />
  );
};

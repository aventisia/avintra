import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { UserCheck2Icon } from "lucide-react";

import { ResourceShareDto } from "../../dtos/resource-share-dto";
import { ResourceAccessTypeEnum } from "../../enums/resource-access-type-enum";
import { useUpdateResourceShareMutation } from "../../hooks/useUpdateResourceShareMutation";

interface FullAccessActionProps {
  item: ResourceShareDto;
}

/**
 * Renders a dropdown menu item for Full access in Resource Share.
 */
export const FullAccessAction = ({ item }: FullAccessActionProps) => {
  const { mutate } = useUpdateResourceShareMutation();

  const handleClick = () => {
    mutate({ ...item, accessLevel: ResourceAccessTypeEnum.FullAccess });
  };

  // Return the component
  return (
    <SimpleDDMenuItem
      onClick={() => handleClick()}
      size="sm"
      content="Full Access"
      Icon={UserCheck2Icon}
    />
  );
};

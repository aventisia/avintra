import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { UserCheck2Icon } from "lucide-react";

import { ResourceShareDto } from "../../dtos/resource-share-dto";
import { ResourceAccessTypeEnum } from "../../enums/resource-access-type-enum";
import { useUpdateResourceShareMutation } from "../../hooks/useUpdateResourceShareMutation";

interface MarkAsOwnerActionProps {
  item: ResourceShareDto;
}

/**
 * Renders a dropdown menu item for Owner access in Resource Share.
 */
export const MarkAsOwnerAction = ({ item }: MarkAsOwnerActionProps) => {
  const { mutate } = useUpdateResourceShareMutation();

  const handleClick = () => {
    mutate({ ...item, accessLevel: ResourceAccessTypeEnum.Owner });
  };

  // Return the component
  return (
    <SimpleDDMenuItem
      onClick={() => handleClick()}
      size="sm"
      content="Mark as owner"
      Icon={UserCheck2Icon}
    />
  );
};

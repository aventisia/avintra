import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { Trash2Icon } from "lucide-react";

import { ResourceShareDto } from "../../dtos/resource-share-dto";
import { ResourceAccessTypeEnum } from "../../enums/resource-access-type-enum";
import { useUpdateResourceShareMutation } from "../../hooks/useUpdateResourceShareMutation";

interface CanDeleteActionProps {
  item: ResourceShareDto;
}

/**
 * Renders a dropdown menu item for Delete access in Resource Share.
 */
export const CanDeleteAction = ({ item }: CanDeleteActionProps) => {
  const { mutate } = useUpdateResourceShareMutation();

  const handleClick = () => {
    mutate({ ...item, accessLevel: ResourceAccessTypeEnum.Delete });
  };

  // Return the component
  return (
    <SimpleDDMenuItem
      onClick={() => handleClick()}
      size="sm"
      content="Can Delete"
      Icon={Trash2Icon}
    />
  );
};

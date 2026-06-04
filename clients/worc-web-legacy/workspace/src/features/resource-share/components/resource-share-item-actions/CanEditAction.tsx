import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { EditIcon } from "lucide-react";

import { ResourceShareDto } from "../../dtos/resource-share-dto";
import { ResourceAccessTypeEnum } from "../../enums/resource-access-type-enum";
import { useUpdateResourceShareMutation } from "../../hooks/useUpdateResourceShareMutation";

interface CanEditActionProps {
  item: ResourceShareDto;
}

/**
 * Renders a dropdown menu item for Edit access in Resource Share.
 */
export const CanEditAction = ({ item }: CanEditActionProps) => {
  const { mutate } = useUpdateResourceShareMutation();

  const handleClick = () => {
    mutate({ ...item, accessLevel: ResourceAccessTypeEnum.Edit });
  };

  // Return the component
  return (
    <SimpleDDMenuItem
      onClick={() => handleClick()}
      size="sm"
      content="Can Edit"
      Icon={EditIcon}
    />
  );
};

import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { EyeIcon } from "lucide-react";

import { ResourceShareDto } from "../../dtos/resource-share-dto";
import { ResourceAccessTypeEnum } from "../../enums/resource-access-type-enum";
import { useUpdateResourceShareMutation } from "../../hooks/useUpdateResourceShareMutation";

interface CanViewActionProps {
  item: ResourceShareDto;
}

/**
 * Renders a dropdown menu item for View access in Resource Share.
 */
export const CanViewAction = ({ item }: CanViewActionProps) => {
  const { mutate } = useUpdateResourceShareMutation();

  const handleClick = () => {
    mutate({ ...item, accessLevel: ResourceAccessTypeEnum.View });
  };

  // Return the component
  return (
    <SimpleDDMenuItem
      onClick={() => handleClick()}
      size="sm"
      content="Can View"
      Icon={EyeIcon}
    />
  );
};

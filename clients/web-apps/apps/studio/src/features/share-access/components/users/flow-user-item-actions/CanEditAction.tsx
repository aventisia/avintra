import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { NotePencilIcon } from "@phosphor-icons/react";

import { FlowUserDto } from "@/features/share-access/dtos/flow-user-dto";
import { useUpdateUserTypeMutation } from "@/features/share-access/hooks/useUpdateUserTypeMutation";

interface CanEditActionProps {
  item: FlowUserDto;
}

/**
 * Renders a dropdown menu item for opening a flow.
 */
export const CanEditAction = ({ item }: CanEditActionProps) => {
  const { mutate } = useUpdateUserTypeMutation();
  const handleClick = () => {
    mutate({ ...item, type: "Edit" });
  };
  // Return the component
  return (
    <SimpleDDMenuItem
      onClick={() => handleClick()}
      size="sm"
      content="Can edit"
      Icon={NotePencilIcon}
    />
  );
};

import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { UserCheck2Icon } from "lucide-react";

import { FlowUserDto } from "@/features/share-access/dtos/flow-user-dto";
import { useUpdateUserTypeMutation } from "@/features/share-access/hooks/useUpdateUserTypeMutation";

interface MarkAsOwnerActionProps {
  item: FlowUserDto;
}

/**
 * Renders a dropdown menu item for opening a flow.
 */
export const MarkAsOwnerAction = ({ item }: MarkAsOwnerActionProps) => {
  const { mutate } = useUpdateUserTypeMutation();
  const handleClick = () => {
    mutate({ ...item, type: "Owner" });
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

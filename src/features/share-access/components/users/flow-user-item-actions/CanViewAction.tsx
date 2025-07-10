import { FlowUserDto } from "@/features/share-access/dtos/flow-user-dto";
import { useUpdateUserTypeMutation } from "@/features/share-access/hooks/useUpdateUserTypeMutation";
import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { EyeIcon } from "lucide-react";

interface CanViewActionProps {
  item: FlowUserDto;
}

/**
 * Renders a dropdown menu item for opening a flow.
 */
export const CanViewAction = ({ item }: CanViewActionProps) => {
  const { mutate } = useUpdateUserTypeMutation();
  const handleClick = () => {
    mutate({ ...item, type: "Viewer" });
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

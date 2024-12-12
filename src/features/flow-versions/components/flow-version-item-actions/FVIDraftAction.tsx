import { SimpleDDMenuItem } from "@/react-toolkit/ui/dropdown-menu/SimpleDDMenuItem";
import { PencilSquareIcon } from "@heroicons/react/24/outline";

interface FVIDraftActionProps {
  flowId: string;
}

/**
 * Renders a dropdown menu item for opening a flow.
 */
export const FVIDraftAction = ({ flowId }: FVIDraftActionProps) => {
  // Return the component
  return (
    <SimpleDDMenuItem
      size="sm"
      content="Use as draft"
      Icon={PencilSquareIcon}
      onClick={() => {
        console.log(flowId);
      }}
    />
  );
};

import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { EyeIcon } from "@heroicons/react/24/outline";

interface FVIViewActionProps {
  flowId: string;
}

/**
 * Renders a dropdown menu item for opening a flow.
 */
export const FVIViewAction = ({ flowId }: FVIViewActionProps) => {
  // Return the component
  return (
    <SimpleDDMenuItem
      size="sm"
      content="View"
      Icon={EyeIcon}
      onClick={() => {
        console.log(flowId);
      }}
    />
  );
};

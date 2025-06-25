import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";
import { useOpenFlow } from "../../hooks/useOpenFlow";

interface AAIOpenActionProps {
  flowId: string;
}

/**
 * Renders a dropdown menu item for opening a flow.
 */
export const AAIOpenAction = ({ flowId }: AAIOpenActionProps) => {
  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  // Return the component
  return (
    <SimpleDDMenuItem
      size="sm"
      content="Open"
      Icon={ArrowTopRightOnSquareIcon}
      onClick={() => handleOpenFlowAction(flowId)}
    />
  );
};

import { useOpenFlow } from "@/features/flows-popover/hooks/useOpenFlow";
import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

interface FLIOpenActionProps {
  flowId: string;
}

/**
 * Renders a dropdown menu item for opening a flow.
 */
export const FLIOpenAction = ({ flowId }: FLIOpenActionProps) => {
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

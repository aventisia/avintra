import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ArrowSquareOutIcon } from "@phosphor-icons/react";

import { useOpenFlow } from "@/features/flows-popover/hooks/useOpenFlow";

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
      Icon={ArrowSquareOutIcon}
      onClick={() => handleOpenFlowAction(flowId)}
    />
  );
};

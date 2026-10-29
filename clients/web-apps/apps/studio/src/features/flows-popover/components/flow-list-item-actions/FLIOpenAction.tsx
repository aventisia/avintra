import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { ExternalLinkIcon } from "lucide-react";

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
      Icon={ExternalLinkIcon}
      onClick={() => handleOpenFlowAction(flowId)}
    />
  );
};

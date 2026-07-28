import { useOpenFlow } from "@/features/flows-popover/hooks/useOpenFlow";
import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { EyeIcon } from "@heroicons/react/24/outline";

interface FVIViewActionProps {
  flowId: string;
  versionId?: string;
  versionNumber?: number | null;
}

/**
 * Renders a dropdown menu item for opening a flow.
 */
export const FVIViewAction = ({ flowId, versionId }: FVIViewActionProps) => {
  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  // Return the component
  return (
    <SimpleDDMenuItem
      size="sm"
      content="View"
      Icon={EyeIcon}
      onClick={() => {
        handleOpenFlowAction(flowId, versionId);
      }}
    />
  );
};

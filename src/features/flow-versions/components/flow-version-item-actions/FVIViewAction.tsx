import { useOpenFlow } from "@/features/flows-popover/hooks/useOpenFlow";
import { SimpleDDMenuItem } from "@aventisia/ui/dropdown-menu";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useFlowsVersionsStore } from "../../stores/flow-versions-store";
import { useShallow } from "zustand/react/shallow";

interface FVIViewActionProps {
  flowId: string;
  versionId?: string;
  versionNumber?: number | null;
}

/**
 * Renders a dropdown menu item for opening a flow.
 */
export const FVIViewAction = ({
  flowId,
  versionId,
  versionNumber,
}: FVIViewActionProps) => {
  // Get handle function to open flow
  const handleOpenFlowAction = useOpenFlow();

  // Get store state and actions
  const { setVersion } = useFlowsVersionsStore(
    useShallow((state) => ({
      setVersion: state.setVersion,
    })),
  );

  // Return the component
  return (
    <SimpleDDMenuItem
      size="sm"
      content="View"
      Icon={EyeIcon}
      onClick={() => {
        handleOpenFlowAction(flowId, versionId);
        setVersion(versionId || "", versionNumber || null);
      }}
    />
  );
};

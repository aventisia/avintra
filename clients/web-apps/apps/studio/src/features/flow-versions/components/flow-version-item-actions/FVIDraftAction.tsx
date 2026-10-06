import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import { useShallow } from "zustand/react/shallow";

import { useInsertFlowVersionMutation } from "../../hooks/useInsertFlowVersion";
import { useFlowVersionPopoverStore } from "../../stores/flow-version-popover-store";

interface FVIDraftActionProps {
  flowId: string;
  versionId: string;
}

/**
 * Renders a dropdown menu item for opening a flow.
 */
export const FVIDraftAction = ({ flowId, versionId }: FVIDraftActionProps) => {
  const { mutate: insertVersion } = useInsertFlowVersionMutation({
    flowId,
    versionId,
  });
  const closePopover = useFlowVersionPopoverStore(useShallow((state) => state.togglePopoverOpen));

  // Return the component
  return (
    <SimpleDDMenuItem
      size="sm"
      content="Use as draft"
      Icon={PencilSquareIcon}
      onClick={() => {
        closePopover(false);
        insertVersion({ flowId });
      }}
    />
  );
};

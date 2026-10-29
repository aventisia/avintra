import { SimpleDDMenuItem } from "@avplatform/ui/dropdown-menu";
import { SquarePenIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useDynamicConfigPanelStore } from "@/features/dynamic-config-panel";
import { useUnsavedChangesGuard } from "@/hooks/useUnsavedChangesGuard";

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
    // This component guards the action below, so suppress the follow-up prompt.
    skipUnsavedGuard: true,
  });
  const closePopover = useFlowVersionPopoverStore(useShallow((state) => state.togglePopoverOpen));

  // The new version is cloned from the saved source, so uncommitted canvas /
  // config-form changes would be lost — confirm before creating it.
  const guardUnsavedChanges = useUnsavedChangesGuard();

  // Return the component
  return (
    <SimpleDDMenuItem
      size="sm"
      content="Use as draft"
      Icon={SquarePenIcon}
      onClick={() => {
        closePopover(false);
        guardUnsavedChanges(() => {
          // Discard the open config panel; the canvas is about to be replaced.
          useDynamicConfigPanelStore.getState().closeNodeConfig();
          insertVersion({ flowId });
        });
      }}
    />
  );
};

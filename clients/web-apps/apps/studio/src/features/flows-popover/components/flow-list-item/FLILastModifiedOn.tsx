import { formatDistanceToNow } from "date-fns";
import { useShallow } from "zustand/react/shallow";

import { FlowsTableDto } from "@/features/flows-popover/dtos/flows-table-dto";
import { useCurrentFlowStore } from "@/stores/current-flow-store";

interface FlowLastModifiedOnProps {
  flowData: FlowsTableDto;
}

/**
 * Renders the last modified date and time of a flow.
 */
export const FLILastModifiedOn = ({
  flowData: { id, lastModifiedOn, lastModifiedBy },
}: FlowLastModifiedOnProps) => {
  // Get global store state and actions
  const { currentFlow } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
    })),
  );

  // Format the time since the flow comment was created
  const formattedTime = lastModifiedOn
    ? formatDistanceToNow(lastModifiedOn, { addSuffix: true })
    : "";

  return (
    <div
      className="mt-[1px] flex items-center text-2xs text-muted-foreground"
      title={`Last modified by ${lastModifiedBy}`}
    >
      {currentFlow.id === id ? "Currently open" : formattedTime}
    </div>
  );
};

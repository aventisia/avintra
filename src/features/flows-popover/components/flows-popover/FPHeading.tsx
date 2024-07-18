import { useShallow } from "zustand/react/shallow";
import { useFlowsPopoverStore } from "../../stores/flows-popover-store";
import { Badge } from "@/react-toolkit/components/ui";

/**
 * Renders a popover heading component for flows list.
 */
export const FPHeading = () => {
  // Get store state and actions
  const { flowsCount } = useFlowsPopoverStore(
    useShallow((state) => ({
      flowsCount: state.flowsCount,
    })),
  );

  return (
    <div className="flex items-center gap-2">
      Flows
      <Badge variant={"secondary"} className="text-2xs">
        {flowsCount}
      </Badge>
    </div>
  );
};

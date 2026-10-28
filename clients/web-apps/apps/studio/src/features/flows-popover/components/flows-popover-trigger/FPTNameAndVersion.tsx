import { Badge } from "@avplatform/ui/badge";
import { Loader2 } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

import { useCurrentFlowStore } from "@/stores/current-flow-store";

/**
 * Renders a flow's name and version component.
 */
export const FPTNameAndVersion = () => {
  // Get global store state and actions
  const { currentFlow, isFlowSaving } = useCurrentFlowStore(
    useShallow((state) => ({
      currentFlow: state.currentFlow,
      isFlowSaving: state.isFlowSaving,
    })),
  );

  // Return flow name and version
  return (
    <>
      {/* flow name */}
      <span className="truncate text-xs">{currentFlow.name}</span>

      {/* flow version container */}
      <Badge variant="outline">
        {/* show flow version is saving */}
        {isFlowSaving ? (
          <>
            <Loader2 className="h-3 w-3 animate-spin text-[--icon-color]" />
            Saving...
          </>
        ) : (
          // show flow version
          <>v1.2.5</>
        )}
      </Badge>
    </>
  );
};

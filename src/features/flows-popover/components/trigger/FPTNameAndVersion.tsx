import { useShallow } from "zustand/react/shallow";
import { Badge } from "@/react-toolkit/components/ui";
import { Loader2 } from "lucide-react";
import { useCurrentFlowStore } from "@/stores";

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
      <Badge
        variant={"default"}
        className="gap-1 bg-white text-3xs text-foreground shadow"
      >
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

import { useReactFlowExtStore } from "@/stores/react-flow-ext-store";
import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { HandIcon, MousePointerIcon } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

/**
 * Renders a arrow (select mode)/ grab handle (move mode) button for the ReactFlowExt component. (VCB=View Control Button)
 */
export const VCBToggleCursor = () => {
  // Get ReactFlowExt store state & actions
  const { panOnDrag, togglePanOnDrag } = useReactFlowExtStore(
    useShallow((state) => ({
      panOnDrag: state.panOnDrag,
      togglePanOnDrag: state.togglePanOnDrag,
    })),
  );

  // Render cursor toggle button
  return (
    <Tooltip content={panOnDrag ? "Move Mode" : "Select Mode"} side="right">
      <Button
        size="icon6"
        className={cn("rounded-md")}
        variant={"ghost"}
        onClick={() => togglePanOnDrag(!panOnDrag)}
      >
        {panOnDrag ? (
          <MousePointerIcon className="h-4 w-4 text-[--icon-color]" />
        ) : (
          <HandIcon className="h-4 w-4 text-[--icon-color]" />
        )}
      </Button>
    </Tooltip>
  );
};

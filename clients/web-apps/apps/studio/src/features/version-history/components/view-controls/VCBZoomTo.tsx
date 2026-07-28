import { ZOOM_ANIMATION_DURATION } from "@/constants";
import { cn } from "@avplatform/ui/lib";
import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { useReactFlow, useStore } from "@xyflow/react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

/**
 * Renders a zoom control button that allows the user to reset the zoom level to 100%.
 */
export const VCBZoomTo = () => {
  // Set state for zoom level
  const [zoomLevel, setZoomLevel] = useState(1);

  // Get ReactFlow state & actions
  const { zoomTo } = useReactFlow();

  // Get zoom level
  const { zoom } = useStore(
    useShallow((state) => ({
      zoom: state.transform[2],
    })),
  );

  // Update zoom level
  useEffect(() => {
    setZoomLevel(zoom);
  }, [zoom]);

  // Render zoom in button
  return (
    <Tooltip content="Reset zoom" side="right">
      <Button
        variant={"ghost"}
        size="icon6"
        className={cn(
          "max-w-[2.8rem] rounded-md font-mono text-3xs font-medium",
        )}
        onClick={() => zoomTo(1, { duration: ZOOM_ANIMATION_DURATION })}
      >
        <span>{Math.round(zoomLevel * 100)}</span>
        <span className="ml-[0.5px] font-mono text-2xs">%</span>
      </Button>
    </Tooltip>
  );
};

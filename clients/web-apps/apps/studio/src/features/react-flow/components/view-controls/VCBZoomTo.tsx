import { Button } from "@avplatform/ui/buttons";
import { Tooltip } from "@avplatform/ui/tooltip";
import { useReactFlow, useStore } from "@xyflow/react";
import { useEffect, useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { ZOOM_ANIMATION_DURATION } from "@/constants";

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
        className="h-6 w-12 rounded-md px-0 font-mono text-[11.5px] font-medium tabular-nums text-ink-2"
        onClick={() => zoomTo(1, { duration: ZOOM_ANIMATION_DURATION })}
      >
        {Math.round(zoomLevel * 100)}%
      </Button>
    </Tooltip>
  );
};

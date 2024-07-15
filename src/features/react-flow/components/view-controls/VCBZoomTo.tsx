import { Button, Tooltip } from "@/react-toolkit/components/ui";
import { cn } from "@/react-toolkit/lib";
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
    <Tooltip content="Reset">
      <Button
        variant={"ghost"}
        size="icon6"
        className={cn("min-w-[2.8rem] rounded-md text-xs font-medium")}
        onClick={() => zoomTo(1)}
      >
        {Math.round(zoomLevel * 100)}%
      </Button>
    </Tooltip>
  );
};

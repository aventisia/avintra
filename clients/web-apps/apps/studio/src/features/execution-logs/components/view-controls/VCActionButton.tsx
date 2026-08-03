import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
import { IconProps } from "@avplatform/ui/types";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";

import { ZOOM_ANIMATION_DURATION } from "@/constants";

interface VCActionButtonProps {
  action: "fitView" | "zoomIn" | "zoomOut";
  Icon: React.ComponentType<IconProps>;
}

/**
 * Renders a view control action button for the ReactFlow component.
 *
 * @param {VCActionButtonProps} props - The component props.
 * @returns {JSX.Element} The rendered VCActionButton component.
 */
export const VCActionButton = ({ action, Icon }: VCActionButtonProps) => {
  // Get ReactFlow actions
  const { zoomOut, zoomIn, fitView } = useReactFlow();

  // Define tooltips based on action
  const tooltips = {
    fitView: "Fit view",
    zoomIn: "Zoom in",
    zoomOut: "Zoom out",
  };

  // Define action handler based on action
  const actionHandler = useCallback(() => {
    if (action === "fitView") {
      fitView({ duration: ZOOM_ANIMATION_DURATION });
    } else if (action === "zoomIn") {
      zoomIn({ duration: ZOOM_ANIMATION_DURATION });
    } else if (action === "zoomOut") {
      zoomOut({ duration: ZOOM_ANIMATION_DURATION });
    }
  }, [action, fitView, zoomIn, zoomOut]);

  // Render action button
  return (
    <Tooltip content={tooltips[action]} side="right">
      <Button size="icon6" className={cn("rounded-md")} variant={"ghost"} onClick={actionHandler}>
        <Icon className="h-4 w-4 text-[--icon-color]" />
      </Button>
    </Tooltip>
  );
};

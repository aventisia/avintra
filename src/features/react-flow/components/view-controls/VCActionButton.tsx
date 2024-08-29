import { cn } from "@/react-toolkit/lib/utils";
import { IconProps } from "@/react-toolkit/types/icon-props";
import { Button } from "@/react-toolkit/ui/buttons/Button";
import { Tooltip } from "@/react-toolkit/ui/custom/Tooltip";
import { useReactFlow } from "@xyflow/react";

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
  const actionHandler = () => {
    if (action === "fitView") {
      fitView({ duration: 500 });
    } else if (action === "zoomIn") {
      zoomIn({ duration: 500 });
    } else if (action === "zoomOut") {
      zoomOut({ duration: 500 });
    }
  };

  // Render action button
  return (
    <Tooltip content={tooltips[action]} side="right">
      <Button
        size="icon6"
        className={cn("rounded-md")}
        variant={"ghost"}
        onClick={actionHandler}
      >
        <Icon className="h-4 w-4 text-[--icon-color]" />
      </Button>
    </Tooltip>
  );
};

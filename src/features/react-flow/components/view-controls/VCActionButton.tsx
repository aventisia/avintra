import { Button, Tooltip } from "@/react-toolkit/components/ui";
import { cn } from "@/react-toolkit/lib";
import { IconProps } from "@/react-toolkit/types";
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
      fitView();
    } else if (action === "zoomIn") {
      zoomIn();
    } else if (action === "zoomOut") {
      zoomOut();
    }
  };

  // Render action button
  return (
    <Tooltip content={tooltips[action]}>
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

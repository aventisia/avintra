import { NodeDetail } from "@/features/execution-logs/components/NodeDetails";

import { Popover, PopoverContent } from "@aventisia/ui/popover";

import { useNodePopoverStore } from "../../stores/node-popover-store";

export const NodePopover = () => {
  const { nodeData, anchorRect, closePopover, setHoveringPopover } =
    useNodePopoverStore();

  if (!nodeData || !anchorRect) return null;

  const VIEWPORT_PADDING = 8;
  const GAP = 8;

  const POPOVER_WIDTH = 480; // align with popover width
  const POPOVER_HEIGHT = 640; //  max height

  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const spaceRight = viewportWidth - anchorRect.right;
  const canOpenRight = spaceRight >= POPOVER_WIDTH + GAP;

  const left = canOpenRight
    ? anchorRect.right + GAP // right side
    : anchorRect.left - POPOVER_WIDTH + GAP; // left side

  // Keep aligned to trigger, but inside viewport
  const top = Math.max(
    VIEWPORT_PADDING,
    Math.min(
      anchorRect.top,
      viewportHeight - POPOVER_HEIGHT - VIEWPORT_PADDING,
    ),
  );

  return (
    <Popover open={true} onOpenChange={closePopover}>
      <PopoverContent
        className="p-2"
        style={{
          position: "fixed",
          top,
          left,
        }}
        onMouseEnter={() => setHoveringPopover(true)}
        onMouseLeave={() => {
          setHoveringPopover(false);
          closePopover();
        }}
      >
        <NodeDetail nodeData={nodeData} />
      </PopoverContent>
    </Popover>
  );
};

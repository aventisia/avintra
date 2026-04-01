import { NodeDetail } from "@/features/execution-logs/components/NodeDetails";

import { Popover, PopoverContent } from "@aventisia/ui/popover";

import { useNodePopoverStore } from "../../stores/node-popover-store";

export const NodePopover = () => {
  const { nodeData, anchorRect, closePopover, setHoveringPopover } =
    useNodePopoverStore();

  if (!nodeData || !anchorRect) return null;

  return (
    <Popover open={true} onOpenChange={closePopover}>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="p-2"
        style={{
          position: "fixed",
          top: anchorRect.top,
          left: anchorRect.right + 8,
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

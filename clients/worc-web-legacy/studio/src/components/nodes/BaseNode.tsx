import { iconMapper } from "@/components/icon-mapper";
import { NodeContainer } from "@/components/node-container";
import { NodeHeading } from "@/components/node-container/node-header/NodeHeading";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useNodePopoverStore } from "@/features/execution-logs/stores/node-popover-store";
import { useGroupToggle } from "@/features/react-flow/hooks/useGroupToggle";
import { NodeDataType } from "@/types/node-data-type";

import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import {
  BoxesIcon,
  CheckCircle2Icon,
  ExpandIcon,
  GroupIcon,
  MonitorIcon,
  Repeat2Icon,
  ShrinkIcon,
  SplitIcon,
} from "lucide-react";
import React, { useRef } from "react";

interface BaseNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  nodeData: NodeDataType;
  nodeId: string;
}

const BaseNode: React.FC<BaseNodeProps> = ({
  selected,
  nodeData,
  children,
  nodeId,
  ...props
}) => {
  const { toggleGroupExpand } = useGroupToggle();
  const isExecutionLog = useIsExecutionLogsRoute();
  const { openPopover, closePopover } = useNodePopoverStore();

  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const renderCount = nodeData?.count
    ? nodeData?.count === 2
      ? 1
      : nodeData?.count === 3
        ? 2
        : nodeData?.count >= 4
          ? 2
          : 0
    : 0;

  const customIconMapper: { [key: string]: JSX.Element } = {
    ConditionalNodeIcon: (
      <SplitIcon className="h-6 w-6 rotate-180 text-white" />
    ),
    LoopNodeIcon: <Repeat2Icon className="h-6 w-6 text-white" />,
    BlockNodeIcon: <BoxesIcon className="h-6 w-6 text-[#1E1B4B]" />,
  };

  // ✅ Hover handlers (Popover control)
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isExecutionLog) return;

    const rect = e.currentTarget.getBoundingClientRect();

    hoverTimeout.current = setTimeout(() => {
      openPopover(nodeId, nodeData, rect);
    }, 200); // prevents flicker
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }

    //  prevent closing if cursor moved into popover
    setTimeout(() => {
      if (!useNodePopoverStore.getState().isHoveringPopover) {
        closePopover();
      }
    }, 100);
  };

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Group stacked preview */}
      {nodeData?.isGroupHead &&
        !nodeData?.isExpanded &&
        Array.from({ length: renderCount }).map((_, i) => (
          <div
            key={i}
            className={`absolute inset-0 left-${
              renderCount - i
            } top-${renderCount - i} -z-10 h-16 w-16 overflow-clip rounded-lg border border-slate-500 bg-white hover:ring hover:ring-ring ${
              nodeData?.isDisabled && "opacity-50"
            } ${nodeData?.isCut && "border-red-400 opacity-60"}`}
          />
        ))}

      <NodeContainer {...{ nodeId, nodeData, selected }} {...props}>
        {nodeData?.isGroupHead && !nodeData?.isExpanded ? (
          <GroupIcon />
        ) : (
          <>
            {/* Platform indicator */}
            {nodeData.supportedPlatforms?.length === 1 &&
              nodeData.supportedPlatforms.includes("windows") && (
                <MonitorIcon className="absolute left-1 top-1 h-2.5 w-2.5 text-muted-foreground" />
              )}

            {/* Execution success indicator */}
            {isExecutionLog && (
              <CheckCircle2Icon className="absolute right-1 top-1 h-[0.7rem] w-[0.7rem] text-green-600" />
            )}

            {/* Icon */}
            {nodeData.icon ? (
              Object.keys(customIconMapper).includes(nodeData.icon) ? (
                customIconMapper[nodeData.icon]
              ) : (
                iconMapper[nodeData.icon]
              )
            ) : (
              <NodeImage src={nodeData.img} />
            )}

            {/* Heading */}
            <NodeHeading
              className={cn(nodeData.type === "blockNode" && "text-[#1E1B4B]")}
            >
              {nodeData.label}
            </NodeHeading>
          </>
        )}

        {/* Expand / Collapse button (non-execution mode only) */}
        {!isExecutionLog && nodeData?.isGroupHead && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Tooltip content={nodeData?.isExpanded ? "Collapse" : "Expand"}>
              <Button
                variant="outline"
                size="icon6"
                className={cn("rounded-full nodrag nopan")}
                onClick={() => toggleGroupExpand(nodeData?.groupId || "")}
              >
                {nodeData?.isExpanded ? (
                  <ShrinkIcon className="h-3.5 w-3.5" />
                ) : (
                  <ExpandIcon className="h-3.5 w-3.5" />
                )}
              </Button>
            </Tooltip>
          </div>
        )}

        {children}
      </NodeContainer>
    </div>
  );
};

export default BaseNode;

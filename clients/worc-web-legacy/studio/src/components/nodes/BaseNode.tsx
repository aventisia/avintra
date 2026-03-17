import { iconMapper } from "@/components/icon-mapper";
import { NodeContainer } from "@/components/node-container";
import { NodeHeading } from "@/components/node-container/node-header/NodeHeading";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
import { useGroupToggle } from "@/features/react-flow/hooks/useGroupToggle";
import { useNodeHover } from "@/hooks/useNodeHover";
import { NodeDataType } from "@/types/node-data-type";

import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import { NodeToolbar, Position } from "@xyflow/react";
import {
  BoxesIcon,
  // CheckCircle2Icon,
  ExpandIcon,
  GroupIcon,
  MonitorIcon,
  Repeat2Icon,
  ShrinkIcon,
  SplitIcon,
  // TriangleAlertIcon,
} from "lucide-react";
import React from "react";

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
  const { isHovered, onMouseEnter, onMouseLeave } = useNodeHover();

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

  return (
    <>
      <div
        className={nodeData?.isGroupHead ? "relative" : "relative"}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {nodeData?.isGroupHead &&
          !nodeData?.isExpanded &&
          Array.from({ length: renderCount }).map((_, i) => (
            <div
              key={i}
              className={`absolute inset-0 left-${renderCount - i} top-${renderCount - i} -z-10 h-16 w-16 overflow-clip rounded-lg border border-slate-500 bg-white hover:ring hover:ring-ring ${nodeData?.isDisabled && "opacity-50"} ${
                nodeData?.isCut && "border-red-400 opacity-60"
              }`}
            />
          ))}
        <NodeContainer {...{ nodeId, nodeData, selected }} {...props}>
          {nodeData?.isGroupHead && !nodeData?.isExpanded ? (
            <GroupIcon />
          ) : (
            <>
              {nodeData.supportedPlatforms?.length == 1 &&
                nodeData.supportedPlatforms.includes("windows") && (
                  <MonitorIcon className="absolute left-1 top-1 h-2.5 w-2.5 text-muted-foreground" />
                )}

              {/* {nodeId.includes("11") && (
                <CheckCircle2Icon className="absolute right-1 top-1 h-[0.7rem] w-[0.7rem] text-green-600" />
              )}
              {nodeId.includes("33") && (
                <TriangleAlertIcon className="absolute bottom-1 right-1 h-2.5 w-2.5 text-red-500" />
              )} */}
              {/* <NodeHeader> */}
              {nodeData.icon ? (
                Object.keys(customIconMapper).includes(nodeData?.icon) ? (
                  customIconMapper[nodeData?.icon]
                ) : (
                  iconMapper[nodeData.icon]
                )
              ) : (
                <NodeImage src={nodeData.img} />
              )}
              <NodeHeading
                className={cn(nodeData.type == "blockNode" && "text-[#1E1B4B]")}
              >
                {nodeData.label}
              </NodeHeading>
            </>
          )}
          <NodeToolbar offset={5} isVisible={isHovered} position={Position.Top}>
            {nodeData?.isGroupHead && (
              <Tooltip content={nodeData?.isExpanded ? "Collapse" : "Expand"}>
                <Button
                  variant={"outline"}
                  size={"icon6"}
                  className={cn(
                    "group z-10 rounded-full ",
                    "hover:bg-primary  mt-1",
                    "aria-[expanded=true]:bg-primary aria-[expanded=true]:opacity-100",
                    "nodrag nopan",
                  )}
                  onClick={() => toggleGroupExpand(nodeData?.groupId || "")}
                >
                  {nodeData?.isExpanded ? (
                    <ShrinkIcon
                      className={cn(
                        "h-3.5 w-3.5 stroke-[1.5] text-[--icon-color] opacity-50",
                        "group-hover:text-white group-hover:opacity-100",
                        "group-aria-[expanded=true]:text-white group-aria-[expanded=true]:opacity-100",
                      )}
                    />
                  ) : (
                    <ExpandIcon
                      className={cn(
                        "h-3.5 w-3.5 stroke-[2.5] text-[--icon-color] opacity-50",
                        "group-hover:text-white group-hover:opacity-100",
                        "group-aria-[expanded=true]:text-white group-aria-[expanded=true]:opacity-100",
                      )}
                    />
                  )}
                </Button>
              </Tooltip>
            )}
          </NodeToolbar>

          {children}
        </NodeContainer>
      </div>
    </>
  );
};

export default BaseNode;

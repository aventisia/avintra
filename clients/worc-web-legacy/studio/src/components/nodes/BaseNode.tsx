import { Button } from "@aventisia/ui/buttons";
import { cn } from "@aventisia/ui/lib";
import { Tooltip } from "@aventisia/ui/tooltip";
import {
  BoxesIcon,
  ExpandIcon,
  GroupIcon,
  MonitorIcon,
  Repeat2Icon,
  ShrinkIcon,
  SplitIcon,
} from "lucide-react";
import React from "react";

import { iconMapper } from "@/components/icon-mapper";
import { NodeContainer } from "@/components/node-container";
import { NodeHeading } from "@/components/node-container/node-header/NodeHeading";
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useGroupToggle } from "@/features/react-flow/hooks/useGroupToggle";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { NodeDataType } from "@/types/node-data-type";

import OpenNodeLog from "../node-container/OpenNodeLog";

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
  const isAgentHistory = useIsVersionHistoryRoute();

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
    <OpenNodeLog nodeId={nodeId}>
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
            {nodeData.supportedPlatforms?.length === 1 &&
              nodeData.supportedPlatforms.includes("windows") && (
                <MonitorIcon className="absolute left-1 top-1 h-2.5 w-2.5 text-muted-foreground" />
              )}

            {nodeData.icon ? (
              Object.keys(customIconMapper).includes(nodeData.icon) ? (
                customIconMapper[nodeData.icon]
              ) : (
                iconMapper[nodeData.icon]
              )
            ) : (
              <NodeImage src={nodeData.img} />
            )}

            <NodeHeading
              className={cn(nodeData.type === "blockNode" && "text-[#1E1B4B]")}
            >
              {nodeData.label}
            </NodeHeading>
          </>
        )}

        {!isExecutionLog && !isAgentHistory && nodeData?.isGroupHead && (
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
    </OpenNodeLog>
  );
};

export default BaseNode;

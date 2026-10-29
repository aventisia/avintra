import { Button } from "@avplatform/ui/buttons";
import { cn } from "@avplatform/ui/lib";
import { Tooltip } from "@avplatform/ui/tooltip";
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
import { NodeImage } from "@/components/node-container/node-header/NodeImage";
import { useGroupToggle } from "@/features/react-flow/hooks/useGroupToggle";
// import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { NodeDataType } from "@/types/node-data-type";

import OpenNodeLog from "../node-container/OpenNodeLog";

interface BaseNodeProps extends React.HTMLAttributes<HTMLDivElement> {
  selected?: boolean;
  nodeData: NodeDataType;
  nodeId: string;
  glyph?: React.ReactNode;
  kind?: React.ReactNode;
}

const BaseNode: React.FC<BaseNodeProps> = ({
  selected,
  nodeData,
  children,
  nodeId,
  glyph: glyphOverride,
  kind,
  ...props
}) => {
  const { toggleGroupExpand } = useGroupToggle();

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
    ConditionalNodeIcon: <SplitIcon className="rotate-180" />,
    LoopNodeIcon: <Repeat2Icon />,
    BlockNodeIcon: <BoxesIcon />,
  };

  const isCollapsedGroup = nodeData?.isGroupHead && !nodeData?.isExpanded;

  const glyph = isCollapsedGroup ? (
    <GroupIcon />
  ) : glyphOverride ? (
    glyphOverride
  ) : nodeData.iconUrl ? (
    <NodeImage src={nodeData.iconUrl} />
  ) : nodeData.icon ? (
    (customIconMapper[nodeData.icon] ?? iconMapper[nodeData.icon])
  ) : (
    <NodeImage src={nodeData.img} />
  );

  return (
    <OpenNodeLog nodeId={nodeId}>
      {isCollapsedGroup &&
        Array.from({ length: renderCount }).map((_, i) => (
          <div
            key={i}
            style={{ translate: `${(renderCount - i) * 4}px ${(renderCount - i) * 4}px` }}
            className={cn(
              "absolute inset-0 -z-10 rounded-md border border-line-strong bg-surface",
              nodeData?.isDisabled && "opacity-50",
              nodeData?.isCut && "border-dashed border-bad opacity-60",
            )}
          />
        ))}

      <NodeContainer
        {...{ nodeId, nodeData, selected, glyph }}
        kind={isCollapsedGroup ? "Group" : kind}
        {...props}
      >
        {!isCollapsedGroup &&
          nodeData.supportedPlatforms?.length === 1 &&
          nodeData.supportedPlatforms.includes("windows") && (
            <MonitorIcon
              aria-label="Windows only"
              className="absolute left-1 top-1 size-2.5 text-muted-foreground"
            />
          )}

        {nodeData?.isGroupHead && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Tooltip content={nodeData?.isExpanded ? "Collapse" : "Expand"}>
              <Button
                variant="outline"
                size="icon6"
                className="nodrag nopan rounded-full"
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

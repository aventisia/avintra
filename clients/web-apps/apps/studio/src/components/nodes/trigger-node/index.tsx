import { cn } from "@avplatform/ui/lib";
import { Node, NodeProps } from "@xyflow/react";
import { memo } from "react";

import { OutputHandle } from "@/components/handles/OutputHandle";
import OpenNodeLog from "@/components/node-container/OpenNodeLog";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { NodeDataType } from "@/types/node-data-type";

type TriggerNode = Node<NodeDataType, "triggerNode">;

export const TriggerNode = memo(
  ({ selected, sourcePosition, id: nodeId }: NodeProps<TriggerNode>) => {
    const isExecutionLog = useIsExecutionLogsRoute();
    return (
      <OpenNodeLog nodeId={nodeId} showIcon={false} showBorder={false}>
        <div
          className={cn(
            "flex h-9 w-16 items-center justify-center gap-2 rounded-full bg-[--flow-start] text-2xs ",
            selected && "border-primary ring ring-ring ",
            isExecutionLog && "!pointer-events-auto cursor-pointer",
          )}
        >
          <span>Start</span>
          <OutputHandle position={sourcePosition} />
        </div>
      </OpenNodeLog>
    );
  },
);

TriggerNode.displayName = "TriggerNode";

import { Button } from "@avplatform/ui/buttons";
import { Node, NodeProps, NodeToolbar, Position } from "@xyflow/react";
import { PlusIcon } from "lucide-react";
import { memo } from "react";

import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { useIsExecutionLogsRoute } from "@/features/execution-logs/hooks/useIsExecutionLogsRoute";
import { useIsVersionHistoryRoute } from "@/features/version-history/hooks/useIsVersionHistoryRoute";
import { useAddConditionalBranch } from "@/hooks/useAddConditionalBranch";
import { ConditionalNodeDataType } from "@/types/conditional-node-data-type";

import BaseNode from "./BaseNode";

type ConditionalNode = Node<ConditionalNodeDataType, "conditionalNode">;

export const ConditionalNode = memo(
  ({ id, data, selected, sourcePosition, targetPosition }: NodeProps<ConditionalNode>) => {
    // Get add switch case branch hook
    const addConditionalBranch = useAddConditionalBranch();

    const showPlusIcon = data?.isGroupHead && !data?.isExpanded;
    const isAgentHistory = useIsVersionHistoryRoute();
    const isExecutionLog = useIsExecutionLogsRoute();

    return (
      <>
        <BaseNode selected={selected} nodeData={data} nodeId={id}>
          <InputHandle position={targetPosition} />
          <OutputHandle position={sourcePosition} connectionCount={2} />
        </BaseNode>
        {showPlusIcon || isAgentHistory || isExecutionLog ? null : (
          <NodeToolbar offset={5} position={Position.Right}>
            <Button
              variant="outline"
              size="icon5"
              className="nodrag nopan mt-1 rounded-full"
              onClick={() => addConditionalBranch(data, id)}
            >
              <PlusIcon className="size-3.5 stroke-[2.5]" />
            </Button>
          </NodeToolbar>
        )}
      </>
    );
  },
);

ConditionalNode.displayName = "ConditionalNode";

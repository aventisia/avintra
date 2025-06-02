import { InputHandle } from "@/components/handles/InputHandle";
import { Node, NodeProps } from "@xyflow/react";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { OpenNodeConfig2 } from "../node-container/node-header/OpenNodeConfig2";
import { NodeDataType } from "@/types/node-data-type";

type BranchNode1 = Node<NodeDataType, "branchNode1">;

export const BranchNode1 = ({
  id: nodeId,
  data: nodeData,
  targetPosition,
  sourcePosition,
}: NodeProps<BranchNode1>) => {
  return (
    <div className="grid h-7 min-w-20 place-items-center rounded-full border-2 border-blue-300 bg-blue-200 text-sm">
      <InputHandle position={targetPosition} className="top-1 opacity-0" />
      <span>{nodeData?.label}</span>
      <OutputHandle position={sourcePosition} />
      {nodeData?.name === "ConditionalBranchActivity" ? (
        <OpenNodeConfig2 {...{ nodeData, nodeId }} />
      ) : null}
    </div>
  );
};

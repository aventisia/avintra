import { InputHandle } from "@/components/handles/InputHandle";
import { Node, NodeProps } from "@xyflow/react";
import { OutputHandle } from "@/components/handles/OutputHandle";

type BranchNode1 = Node<{
  label?: string;
}, "branchNode1">;

export const BranchNode1 = ({
  data,
  targetPosition,
  sourcePosition,
}: NodeProps<BranchNode1>) => {
  return (
    <div className="grid h-7 min-w-20 place-items-center rounded-full border-2 border-blue-300 bg-blue-200 text-sm">
      <InputHandle position={targetPosition} className="top-1 opacity-0" />
      <span>{data?.label}</span>
      <OutputHandle position={sourcePosition} />
    </div>
  );
};

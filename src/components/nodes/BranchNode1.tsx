import { InputHandle } from "@/components/handles/InputHandle";
import { Node, NodeProps } from "@xyflow/react";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { OpenNodeConfig } from "../node-container/node-header/OpenNodeConfig";
import { NodeDataType } from "@/types/node-data-type";
import { ReactFlowContextMenu } from "@/features/react-flow/components/context-menu";

type BranchNode1 = Node<NodeDataType, "branchNode1">;

export const BranchNode1 = ({
  id: nodeId,
  data: nodeData,
  targetPosition,
  sourcePosition,
}: NodeProps<BranchNode1>) => {
  return (
    <>
      <ReactFlowContextMenu>
        {nodeData?.name === "ConditionalBranchActivity" ? (
          <OpenNodeConfig {...{ nodeData, nodeId }}>
            <div className="flex h-7 w-[19.5rem] justify-center">
              <div className="grid place-items-center rounded-full border-2 border-indigo-400 bg-indigo-200 px-2 text-sm hover:ring hover:ring-ring">
                <InputHandle
                  position={targetPosition}
                  className="rounded-full opacity-0"
                />
                <span className="max-w-60 truncate">{nodeData?.label}</span>
                <OutputHandle position={sourcePosition} />
              </div>
            </div>
          </OpenNodeConfig>
        ) : (
          <div className="flex h-7 w-[19.5rem] justify-center">
            <div className="grid h-7 w-fit place-items-center rounded-full border-2 border-slate-400 bg-slate-200 px-2 text-sm">
              <InputHandle
                position={targetPosition}
                className="rounded-full opacity-0"
              />
              <span>{nodeData?.label}</span>
              <OutputHandle position={sourcePosition} />
            </div>
          </div>
        )}
      </ReactFlowContextMenu>
    </>
  );
};

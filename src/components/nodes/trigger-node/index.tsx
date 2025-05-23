import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeSelector } from "@/features/action-selector/components";
import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";
import { NodeDataType } from "@/types/node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import BaseNode from "../BaseNode";
import { ReplaceFlowTrigger } from "./ReplaceFlowTrigger";

type TriggerNode = Node<NodeDataType, "triggerNode">;

export const TriggerNode = ({
  id,
  data,
  selected,
  sourcePosition,
}: NodeProps<TriggerNode>) => {
  // Get setOrigin from store
  const { setOrigin } = useNodeSelectorStore(
    useShallow((state) => ({
      setOrigin: state.setOrigin,
    })),
  );

  return (
    <>
      <NodeSelector>
        <ReplaceFlowTrigger onClick={() => setOrigin("ReplaceTrigger", "NA")} />
      </NodeSelector>
      <BaseNode
        selected={selected}
        nodeData={data}
        nodeId={id}
        className="border-green-600 ring-1 ring-green-600"
      >
        <OutputHandle position={sourcePosition} />
      </BaseNode>
    </>
  );
};

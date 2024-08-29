import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeSelector } from "@/components/node-selector";
import { useNodeSelectorStore } from "@/stores/node-selector-store";
import { TriggerNodeDataType } from "@/types/trigger-node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import BaseNode from "../BaseNode";
import { ReplaceFlowTrigger } from "./ReplaceFlowTrigger";

type TriggerNode = Node<TriggerNodeDataType, "triggerNode">;

export const TriggerNode = ({
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
    <BaseNode
      selected={selected}
      data={data}
      className="border-green-600 ring-1 ring-green-600"
    >
      <NodeSelector sideOffset={10} alignOffset={-12}>
        <ReplaceFlowTrigger onClick={() => setOrigin("ReplaceTrigger", "NA")} />
      </NodeSelector>
      <OutputHandle position={sourcePosition} />
    </BaseNode>
  );
};

import { OutputHandle } from "@/components/handles/OutputHandle";
import { TriggerNodeDataType } from "@/types/trigger-node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import BaseNode from "../BaseNode";
import { ReplaceFlowTrigger } from "./ReplaceFlowTrigger";
import { NodeSelector } from "@/features/action-selector/components";
import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";

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
    <>
      <NodeSelector sideOffset={10} alignOffset={-12}>
        <ReplaceFlowTrigger onClick={() => setOrigin("ReplaceTrigger", "NA")} />
      </NodeSelector>
      <BaseNode
        selected={selected}
        data={data}
        className="border-green-600 ring-1 ring-green-600"
      >
        <OutputHandle position={sourcePosition} />
      </BaseNode>
    </>
  );
};

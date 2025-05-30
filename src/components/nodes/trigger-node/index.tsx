import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeSelector } from "@/features/action-selector/components";
import { useNodeSelectorStore } from "@/features/action-selector/stores/action-selector-store";
import { NodeDataType } from "@/types/node-data-type";
import { Node, NodeProps } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { ReplaceFlowTrigger } from "./ReplaceFlowTrigger";
import { cn } from "@aventisia/ui/lib";

type TriggerNode = Node<NodeDataType, "triggerNode">;

export const TriggerNode = ({
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
      <div
        className={cn(
          "flex h-6 w-14 items-center justify-center gap-2 rounded-full border-2 border-[--flow-border-start] bg-[--flow-start] text-3xs",
          selected && "border-primary ring-1 ring-ring",
        )}
      >
        <span> Starts</span>
        <OutputHandle position={sourcePosition} />
      </div>
    </>
  );
};

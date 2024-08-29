import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeSelector } from "@/components/node-selector";
import { useNodeSelectorStore } from "@/stores/node-selector-store";
import { NodeSelectorOriginType } from "@/types/node-selector-origin-type";
import { NodeProps } from "@xyflow/react";
import { useShallow } from "zustand/react/shallow";
import { PlusNodeTrigger } from "./PlusNodeTrigger";

export const PlusNode = ({
  id,
  type,
  targetPosition,
  sourcePosition,
}: NodeProps) => {
  // Get setOrigin from store
  const { setOrigin } = useNodeSelectorStore(
    useShallow((state) => ({
      setOrigin: state.setOrigin,
    })),
  );

  return (
    <>
      <NodeSelector sideOffset={10} alignOffset={-10}>
        <PlusNodeTrigger
          onClick={() => setOrigin(type as NodeSelectorOriginType, id)}
        />
      </NodeSelector>

      <InputHandle position={targetPosition} className="opacity-0" />

      <OutputHandle position={sourcePosition} className="opacity-0" />
    </>
  );
};

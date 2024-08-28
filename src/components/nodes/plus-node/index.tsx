import { InputHandle } from "@/components/handles/InputHandle";
import { OutputHandle } from "@/components/handles/OutputHandle";
import { NodeSelector } from "@/components/node-selector";
import { NodeProps } from "@xyflow/react";
import { PlusNodeTrigger } from "./PlusNodeTrigger";
import { NodeSelectorOriginType } from "@/types/node-selector-origin-type";

export const PlusNode = ({
  id,
  type,
  targetPosition,
  sourcePosition,
}: NodeProps) => {
  return (
    <>
      <NodeSelector
        originId={id}
        origin={type as NodeSelectorOriginType}
        sideOffset={10}
        alignOffset={-10}
      >
        <PlusNodeTrigger />
      </NodeSelector>

      <InputHandle position={targetPosition} className="opacity-0" />

      <OutputHandle position={sourcePosition} className="opacity-0" />
    </>
  );
};

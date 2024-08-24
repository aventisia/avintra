import { InputHandle } from "@/components/handles/InputHandle";
import { NodeSelector } from "@/components/node-selector";
import { NodeProps } from "@xyflow/react";
import { PlusNodeTrigger } from "./PlusNodeTrigger";
import { OutputHandle } from "@/components/handles/OutputHandle";

export const PlusNode = ({ id, targetPosition, sourcePosition }: NodeProps) => {
  return (
    <>
      <NodeSelector
        originId={id}
        origin="PlusNode"
        sideOffset={10}
        alignOffset={-10}
      >
        <PlusNodeTrigger />
      </NodeSelector>

      <InputHandle position={targetPosition} />

      {sourcePosition && <OutputHandle position={sourcePosition} />}
    </>
  );
};

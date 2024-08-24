import { InputHandle } from "@/components/handles/InputHandle";
import { NodeSelector } from "@/components/node-selector";
import { NodeProps } from "@xyflow/react";
import { PlusNodeTrigger } from "./PlusNodeTrigger";

export const PlusNode = ({ id, targetPosition }: NodeProps) => {
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
    </>
  );
};

import { NodeSelector } from "@/components/node-selector";
import { NodeProps } from "@xyflow/react";
import { InputHandle } from "../../handles/InputHandle";
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
      {/* Input (Target) Handle */}
      <InputHandle position={targetPosition} />
    </>
  );
};

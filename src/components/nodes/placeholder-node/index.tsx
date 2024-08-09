import { NodeSelector } from "@/components/node-selector";
import { NodeProps } from "@xyflow/react";
import { InputHandle } from "../../handles/InputHandle";
import { PlaceholderPlusTrigger } from "./PlaceholderPlusTrigger";

export const PlaceholderNode = ({ targetPosition }: NodeProps) => {
  return (
    <>
      <NodeSelector origin="PlaceholderNode" sideOffset={10} alignOffset={-10}>
        <PlaceholderPlusTrigger />
      </NodeSelector>
      {/* Input (Target) Handle */}
      <InputHandle position={targetPosition} />
    </>
  );
};

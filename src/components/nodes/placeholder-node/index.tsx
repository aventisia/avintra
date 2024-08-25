import { InputHandle } from "@/components/handles/InputHandle";
import { NodeSelector } from "@/components/node-selector";
import { NodeProps } from "@xyflow/react";
import { PlaceholderNodeTrigger } from "./PlaceholderNodeTrigger";
import { OutputHandle } from "@/components/handles/OutputHandle";

export const PlaceholderNode = ({
  id,
  targetPosition,
  sourcePosition,
}: NodeProps) => {
  return (
    <>
      <NodeSelector
        originId={id}
        origin="PlaceholderNode"
        sideOffset={10}
        alignOffset={-10}
      >
        <PlaceholderNodeTrigger />
      </NodeSelector>

      <InputHandle position={targetPosition} className="opacity-0" />

      <OutputHandle position={sourcePosition} className="opacity-0" />
    </>
  );
};

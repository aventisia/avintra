import { NodeToolbar, Position } from "@xyflow/react";
import { TriggerSelector } from "../trigger-selector";

export const ReplaceFlowTrigger = () => {
  return (
    <NodeToolbar offset={5} position={Position.Top}>
      <TriggerSelector
        side="right"
        alignOffset={-14}
        sideOffset={16}
      />
    </NodeToolbar>
  );
};

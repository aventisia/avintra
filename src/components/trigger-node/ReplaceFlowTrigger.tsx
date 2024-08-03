import { NodeToolbar, Position } from "@xyflow/react";
import { NodeSelector } from "../node-selector";

export const ReplaceFlowTrigger = () => {
  return (
    <NodeToolbar offset={5} position={Position.Top}>
      <NodeSelector
        origin="ReplaceFlowTrigger"
        side="right"
        alignOffset={-14}
        sideOffset={16}
      />
    </NodeToolbar>
  );
};

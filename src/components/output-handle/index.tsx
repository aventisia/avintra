import { NodeToolbar, Position } from "@xyflow/react";
import { NodeSelector } from "../node-selector";
import { HandleExt } from "./HandleExt";

interface OutputHandleProps {
  handlePosition?: Position;
}

export const OutputHandle = ({
  handlePosition = Position.Bottom,
}: OutputHandleProps) => {
  // Render output handle
  return (
    <>
      <HandleExt handlePosition={handlePosition} />
      {/* Node selector to add new node */}
      <NodeToolbar offset={15} position={handlePosition}>
        <NodeSelector
          origin="OutputHandle"
          side="right"
          alignOffset={-14}
          sideOffset={16}
        />
      </NodeToolbar>
    </>
  );
};

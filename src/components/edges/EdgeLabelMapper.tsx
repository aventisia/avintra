import { TrueEdgeLabel } from "./edge-labels/TrueEdgeLabel";
import { FalseEdgeLabel } from "./edge-labels/FalseEdgeLabel";
import { BaseEdgeLabel } from "./edge-labels/BaseEdgeLabel";
import { NodeSelector } from "../node-selector";
import { PlusEdgeLabel } from "./edge-labels/PlusEdgeLabel";

export const edgeLabelMapper = (edgeId: string, label: string): JSX.Element => {
  switch (label.toLowerCase()) {
    case "true":
      return <TrueEdgeLabel />;
    case "false":
      return <FalseEdgeLabel />;
    case "plus":
      return (
        <NodeSelector
          origin="PlusEdgeLabel"
          originId={edgeId}
          sideOffset={10}
          alignOffset={-12}
        >
          <PlusEdgeLabel />
        </NodeSelector>
      );
    default:
      return <BaseEdgeLabel>{label}</BaseEdgeLabel>;
  }
};

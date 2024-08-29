import { TrueEdgeLabel } from "./edge-labels/TrueEdgeLabel";
import { FalseEdgeLabel } from "./edge-labels/FalseEdgeLabel";
import { BaseEdgeLabel } from "./edge-labels/BaseEdgeLabel";
import { NodeSelector } from "../node-selector";
import { PlusEdgeLabel } from "./edge-labels/PlusEdgeLabel";

export const edgeLabelMapper = (label: string, edgeId?: string, ): JSX.Element => {
  switch (label.toLowerCase()) {
    case "true":
      return <TrueEdgeLabel />;
    case "false":
      return <FalseEdgeLabel />;
    case "plus":
      return (
        <NodeSelector sideOffset={10} alignOffset={-12}>
          <PlusEdgeLabel edgeId={edgeId} />
        </NodeSelector>
      );
    default:
      return <BaseEdgeLabel>{label}</BaseEdgeLabel>;
  }
};

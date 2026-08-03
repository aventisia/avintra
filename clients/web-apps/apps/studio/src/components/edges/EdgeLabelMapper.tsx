import { BaseEdgeLabel } from "./edge-labels/BaseEdgeLabel";
import { FalseEdgeLabel } from "./edge-labels/FalseEdgeLabel";
import { PlusEdgeLabel } from "./edge-labels/PlusEdgeLabel";
import { TrueEdgeLabel } from "./edge-labels/TrueEdgeLabel";

export const edgeLabelMapper = (label: string, edgeId?: string): JSX.Element => {
  switch (label.toLowerCase()) {
    case "true":
      return <TrueEdgeLabel />;
    case "false":
      return <FalseEdgeLabel />;
    case "plus":
      return <PlusEdgeLabel edgeId={edgeId} />;
    default:
      return <BaseEdgeLabel>{label}</BaseEdgeLabel>;
  }
};

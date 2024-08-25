import { TrueEdgeLabel } from "./TrueEdgeLabel";
import { FalseEdgeLabel } from "./FalseEdgeLabel";

export const edgeLabelMapper: { [key: string]: JSX.Element } = {
  TrueEdgeLabel: <TrueEdgeLabel />,
  FalseEdgeLabel: <FalseEdgeLabel />,
};

import { CustomNodeType } from "@/types/custom-node-type";
import { NodeInputType } from "@/types/node-data-type";

type GraphProposalNodeSpec = {
  id: string;
  type: CustomNodeType;
  name?: string;
  label?: string;
  description?: string;
  img?: string;
  icon?: string;
  supportedPlatforms?: string[];
  inputs?: NodeInputType[];
  position?: { x: number; y: number };
};

type GraphProposalEdgeSpec = {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
};

type GraphProposalOperation =
  | { type: "addNode"; node: GraphProposalNodeSpec }
  | { type: "updateNode"; node: GraphProposalNodeSpec }
  | { type: "removeNode"; id: string }
  | { type: "addEdge"; edge: GraphProposalEdgeSpec }
  | { type: "removeEdge"; id: string };

export type { GraphProposalNodeSpec, GraphProposalEdgeSpec, GraphProposalOperation };

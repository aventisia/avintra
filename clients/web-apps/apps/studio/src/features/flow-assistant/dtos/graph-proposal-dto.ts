import { GraphProposalOperation } from "../types/graph-proposal-type";

/** A reviewable graph change proposed by the flow assistant. */
export interface GraphProposalDto {
  id: string;
  summary: string;
  mode: "create" | "edit";
  operations: GraphProposalOperation[];
}

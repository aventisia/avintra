import { NodeDataType } from "@/types/node-data-type";

import { FLOW_ASSISTANT_NODE_ALLOWLIST } from "../constants";
import { GraphProposalNodeSpec } from "../types/graph-proposal-type";

/** Resolves a proposed node to its curated catalog definition, or null when ungrounded. */
export const findGroundedNode = (spec: GraphProposalNodeSpec): NodeDataType | null =>
  FLOW_ASSISTANT_NODE_ALLOWLIST.find(
    (entry) => entry.type === spec.type && entry.name === spec.name,
  ) ?? null;

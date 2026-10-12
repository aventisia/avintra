import { Edge, Node } from "@xyflow/react";

import { GraphProposalDto } from "../dtos/graph-proposal-dto";
import { findGroundedNode } from "./grounding.util";

type GraphProposalValidation = {
  isValid: boolean;
  errors: string[];
};

const isStructuralNode = (node: Node): boolean =>
  node.type === "triggerNode" || node.type === "flowEndNode";

/**
 * Validates a graph proposal against the curated allowlist and the current graph.
 *
 * @param proposal - The proposal to validate.
 * @param currentNodes - Nodes currently on the canvas.
 * @param currentEdges - Edges currently on the canvas.
 */
export const validateGraphProposal = (
  proposal: GraphProposalDto,
  currentNodes: Node[],
  currentEdges: Edge[],
): GraphProposalValidation => {
  const errors: string[] = [];

  if (proposal.operations.length === 0) {
    errors.push("The proposal contains no operations.");
    return { isValid: false, errors };
  }

  const baseNodeIds =
    proposal.mode === "create"
      ? new Set(currentNodes.filter(isStructuralNode).map((node) => node.id))
      : new Set(currentNodes.map((node) => node.id));
  const baseEdgeIds = new Set(currentEdges.map((edge) => edge.id));

  const addedNodeIds = new Set<string>();
  const removedNodeIds = new Set<string>();
  const addedEdgeIds = new Set<string>();

  for (const operation of proposal.operations) {
    if (operation.type === "addNode") {
      const grounded = findGroundedNode(operation.node);
      if (!grounded) {
        errors.push(`Unknown node "${operation.node.name ?? operation.node.type}".`);
      }
      if (addedNodeIds.has(operation.node.id) || baseNodeIds.has(operation.node.id)) {
        errors.push(`Duplicate node id "${operation.node.id}".`);
      }
      addedNodeIds.add(operation.node.id);
    } else if (operation.type === "updateNode") {
      if (!findGroundedNode(operation.node)) {
        errors.push(`Unknown node "${operation.node.name ?? operation.node.type}".`);
      }
      if (!baseNodeIds.has(operation.node.id) && !addedNodeIds.has(operation.node.id)) {
        errors.push(`Update references missing node "${operation.node.id}".`);
      }
    } else if (operation.type === "removeNode") {
      if (!baseNodeIds.has(operation.id)) {
        errors.push(`Removal references missing node "${operation.id}".`);
      }
      removedNodeIds.add(operation.id);
    }
  }

  const knownNodeIds = new Set([...baseNodeIds, ...addedNodeIds]);
  removedNodeIds.forEach((id) => knownNodeIds.delete(id));

  for (const operation of proposal.operations) {
    if (operation.type === "addEdge") {
      if (!knownNodeIds.has(operation.edge.source) || !knownNodeIds.has(operation.edge.target)) {
        errors.push(`Edge "${operation.edge.id}" references a missing node.`);
      }
      if (addedEdgeIds.has(operation.edge.id) || baseEdgeIds.has(operation.edge.id)) {
        errors.push(`Duplicate edge id "${operation.edge.id}".`);
      }
      addedEdgeIds.add(operation.edge.id);
    } else if (operation.type === "removeEdge") {
      if (!baseEdgeIds.has(operation.id)) {
        errors.push(`Removal references missing edge "${operation.id}".`);
      }
    }
  }

  return { isValid: errors.length === 0, errors };
};

import { Edge, Node } from "@xyflow/react";
import { z } from "zod";

import { GraphProposalDto } from "../dtos/graph-proposal-dto";
import { FlowAssistantConfigField } from "../generated/flow-assistant-config-metadata";
import { GraphProposalNodeSpec } from "../types/graph-proposal-type";
import { findGroundedNode } from "./grounding.util";
import { findNodeConfigMetadata, isBooleanField, isNumberField } from "./node-config-metadata.util";

type GraphProposalValidation = {
  isValid: boolean;
  errors: string[];
};

const isStructuralNode = (node: Node): boolean =>
  node.type === "triggerNode" || node.type === "flowEndNode";

const resolveNodeLabel = (node: GraphProposalNodeSpec): string =>
  node.label ?? node.name ?? node.type;

const buildFieldSchema = (field: FlowAssistantConfigField) => {
  if (isNumberField(field)) return z.number();
  if (isBooleanField(field)) return z.boolean();
  return z.string();
};

const validateNodeConfiguration = (
  node: GraphProposalNodeSpec,
  isAdd: boolean,
  errors: string[],
): void => {
  const label = resolveNodeLabel(node);
  const metadata = findNodeConfigMetadata(node.type, node.name);
  const providedInputKeys = new Set<string>();

  for (const input of node.inputs ?? []) {
    const key = typeof input?.key === "string" ? input.key : "";
    if (!key) {
      errors.push(`Node "${label}" has an input without a key.`);
      continue;
    }

    const field = metadata?.fields.find(
      (candidate) => candidate.name === key && candidate.direction === "Input",
    );
    if (!field) {
      errors.push(`Unknown input "${key}" for node "${label}".`);
      continue;
    }

    const parsed = buildFieldSchema(field).safeParse(input.value);
    if (!parsed.success) {
      errors.push(`Input "${key}" for node "${label}" has an invalid value.`);
    } else if (
      field.selectOptions &&
      field.selectOptions.length > 0 &&
      typeof input.value === "string" &&
      !field.selectOptions.includes(input.value)
    ) {
      errors.push(
        `Input "${key}" for node "${label}" must be one of: ${field.selectOptions.join(", ")}.`,
      );
    }

    providedInputKeys.add(key);
  }

  if (isAdd) {
    for (const field of metadata?.fields ?? []) {
      if (field.direction === "Input" && field.required && !providedInputKeys.has(field.name)) {
        errors.push(`Required input "${field.name}" is missing for node "${label}".`);
      }
    }
  }

  for (const output of node.outputs ?? []) {
    const key = typeof output?.key === "string" ? output.key : "";
    if (!key) {
      errors.push(`Node "${label}" has an output without a key.`);
      continue;
    }

    const field = metadata?.fields.find(
      (candidate) => candidate.name === key && candidate.direction === "Output",
    );
    if (!field) {
      errors.push(`Unknown output "${key}" for node "${label}".`);
      continue;
    }

    const value = output.value;
    if (
      typeof value !== "object" ||
      value === null ||
      typeof value.enabled !== "boolean" ||
      !("value" in value)
    ) {
      errors.push(`Output "${key}" for node "${label}" has an invalid value.`);
    }
  }
};

/**
 * Validates a graph proposal against the curated allowlist, the node configuration metadata,
 * and the current graph.
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
      validateNodeConfiguration(operation.node, true, errors);
    } else if (operation.type === "updateNode") {
      if (!findGroundedNode(operation.node)) {
        errors.push(`Unknown node "${operation.node.name ?? operation.node.type}".`);
      }
      if (!baseNodeIds.has(operation.node.id) && !addedNodeIds.has(operation.node.id)) {
        errors.push(`Update references missing node "${operation.node.id}".`);
      }
      validateNodeConfiguration(operation.node, false, errors);
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

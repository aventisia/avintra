import { Edge, Node } from "@xyflow/react";

import { NodeDataType } from "@/types/node-data-type";
import { createDottedEdgeObj } from "@/utils/create-edges/create-dotted-edge-obj";
import { createPlusEdgeObj } from "@/utils/create-edges/create-plus-edge-obj";
import { createNodeObj } from "@/utils/create-nodes/create-node-obj";
import { createSupportNodeObj } from "@/utils/create-nodes/create-support-node-obj";

import { GraphProposalDto } from "../dtos/graph-proposal-dto";
import { GraphProposalNodeSpec } from "../types/graph-proposal-type";
import { findGroundedNode } from "./grounding.util";

type GraphProposalApplyResult = { nodes: Node[]; edges: Edge[] };

const buildNodeData = (spec: GraphProposalNodeSpec): NodeDataType => {
  const grounded = findGroundedNode(spec);
  return {
    type: spec.type,
    name: spec.name ?? grounded?.name ?? spec.type,
    label: spec.label ?? grounded?.label ?? spec.type,
    description: spec.description ?? grounded?.description ?? "",
    img: spec.img ?? grounded?.img,
    icon: spec.icon ?? grounded?.icon,
    supportedPlatforms: spec.supportedPlatforms ?? grounded?.supportedPlatforms,
    inputs: spec.inputs ?? grounded?.inputs,
  };
};

const createProposalNode = (spec: GraphProposalNodeSpec, id: string): Node => ({
  ...createNodeObj(buildNodeData(spec)),
  id,
  position: spec.position ?? { x: 0, y: 0 },
});

const createProposalEdge = (
  source: string,
  target: string,
  sourceHandle?: string,
  targetHandle?: string,
): Edge => ({
  ...createPlusEdgeObj(source, target),
  sourceHandle,
  targetHandle,
});

const createTriggerNode = (): Node =>
  createNodeObj({
    type: "triggerNode",
    name: "manualTrigger",
    label: "Manual trigger",
    description: "Start your flow clicking the execute button",
    icon: "ManualTriggerIcon",
  });

const createAiSupportNode = (aiNodeId: string): { node: Node; edge: Edge } => {
  const modelNode = createSupportNodeObj("modelNode", aiNodeId, true);
  const modelEdge = createDottedEdgeObj(modelNode.id, aiNodeId, undefined, "model-node");
  return { node: modelNode, edge: modelEdge };
};

const buildFromScratch = (
  currentNodes: Node[],
  proposal: GraphProposalDto,
): GraphProposalApplyResult => {
  const trigger = currentNodes.find((node) => node.type === "triggerNode") ?? createTriggerNode();
  const flowEnd = createSupportNodeObj("flowEndNode");

  const idMap = new Map<string, string>();
  const nodes: Node[] = [trigger];
  const edges: Edge[] = [];
  const supportNodes: Node[] = [];
  const supportEdges: Edge[] = [];

  for (const operation of proposal.operations) {
    if (operation.type !== "addNode") continue;
    const realId = window.crypto.randomUUID();
    idMap.set(operation.node.id, realId);
    const node = createProposalNode(operation.node, realId);
    nodes.push(node);

    if (node.type === "aiNode") {
      const support = createAiSupportNode(realId);
      supportNodes.push(support.node);
      supportEdges.push(support.edge);
    }
  }

  for (const operation of proposal.operations) {
    if (operation.type !== "addEdge") continue;
    edges.push(
      createProposalEdge(
        idMap.get(operation.edge.source) ?? operation.edge.source,
        idMap.get(operation.edge.target) ?? operation.edge.target,
        operation.edge.sourceHandle,
        operation.edge.targetHandle,
      ),
    );
  }

  const incoming = new Set(edges.map((edge) => edge.target));
  const outgoing = new Set(edges.map((edge) => edge.source));
  const proposalNodeIds = [...idMap.values()];

  for (const rootId of proposalNodeIds.filter((id) => !incoming.has(id))) {
    edges.push(createProposalEdge(trigger.id, rootId));
  }
  for (const tailId of proposalNodeIds.filter((id) => !outgoing.has(id))) {
    edges.push(createProposalEdge(tailId, flowEnd.id));
  }

  nodes.push(...supportNodes, flowEnd);
  edges.push(...supportEdges);
  return { nodes, edges };
};

const mergeIntoGraph = (
  currentNodes: Node[],
  currentEdges: Edge[],
  proposal: GraphProposalDto,
): GraphProposalApplyResult => {
  const idMap = new Map<string, string>();
  let nodes = [...currentNodes];
  let edges = [...currentEdges];

  for (const operation of proposal.operations) {
    if (operation.type !== "addNode") continue;
    const realId = window.crypto.randomUUID();
    idMap.set(operation.node.id, realId);
    const node = createProposalNode(operation.node, realId);
    nodes.push(node);

    if (node.type === "aiNode") {
      const support = createAiSupportNode(realId);
      nodes.push(support.node);
      edges.push(support.edge);
    }
  }

  for (const operation of proposal.operations) {
    if (operation.type === "updateNode") {
      const realId = idMap.get(operation.node.id) ?? operation.node.id;
      const patch = buildNodeData(operation.node);
      nodes = nodes.map((node) =>
        node.id === realId ? { ...node, data: { ...(node.data as NodeDataType), ...patch } } : node,
      );
    } else if (operation.type === "removeNode") {
      nodes = nodes.filter((node) => node.id !== operation.id);
    }
  }

  for (const operation of proposal.operations) {
    if (operation.type === "addEdge") {
      edges.push(
        createProposalEdge(
          idMap.get(operation.edge.source) ?? operation.edge.source,
          idMap.get(operation.edge.target) ?? operation.edge.target,
          operation.edge.sourceHandle,
          operation.edge.targetHandle,
        ),
      );
    } else if (operation.type === "removeEdge") {
      edges = edges.filter((edge) => edge.id !== operation.id);
    }
  }

  const nodeIds = new Set(nodes.map((node) => node.id));
  edges = edges.filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target));

  return { nodes, edges };
};

/**
 * Transforms a validated graph proposal into the next canvas nodes and edges.
 *
 * @param currentNodes Nodes currently on the canvas.
 * @param currentEdges Edges currently on the canvas.
 * @param proposal The proposal to apply.
 */
export const applyGraphProposal = (
  currentNodes: Node[],
  currentEdges: Edge[],
  proposal: GraphProposalDto,
): GraphProposalApplyResult =>
  proposal.mode === "create"
    ? buildFromScratch(currentNodes, proposal)
    : mergeIntoGraph(currentNodes, currentEdges, proposal);

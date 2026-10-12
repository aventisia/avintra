import { Edge, Node } from "@xyflow/react";

import { NodeDataType } from "@/types/node-data-type";
import { createDottedEdgeObj } from "@/utils/create-edges/create-dotted-edge-obj";
import { createPlusEdgeObj } from "@/utils/create-edges/create-plus-edge-obj";
import { createConditionalNode } from "@/utils/create-nodes/create-conditional-node";
import { createForLoopNode } from "@/utils/create-nodes/create-for-loop-node";
import { createNodeObj } from "@/utils/create-nodes/create-node-obj";
import { createSupportNodeObj } from "@/utils/create-nodes/create-support-node-obj";

import { GraphProposalDto } from "../dtos/graph-proposal-dto";
import { GraphProposalNodeSpec } from "../types/graph-proposal-type";
import { findGroundedNode } from "./grounding.util";

type GraphProposalApplyResult = { nodes: Node[]; edges: Edge[] };

type ControlNodeScaffold = {
  nodes: Node[];
  edges: Edge[];
  controlNodeId: string;
  mergeNodeId: string;
};

const CONTROL_NODE_TYPES = new Set(["conditionalNode", "forLoopNode"]);

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

const createControlScaffold = (spec: GraphProposalNodeSpec): ControlNodeScaffold => {
  const placeholderSourceId = `__flow-assistant-control-source-${spec.id}`;
  const built =
    spec.type === "conditionalNode"
      ? createConditionalNode(buildNodeData(spec), placeholderSourceId)
      : createForLoopNode(buildNodeData(spec), placeholderSourceId);
  const controlNode = built.newNodes.find((node) => node.type === spec.type) ?? built.newNodes[0];

  return {
    nodes: built.newNodes,
    edges: built.newEdges.filter((edge) => edge.source !== placeholderSourceId),
    controlNodeId: controlNode.id,
    mergeNodeId: built.lastNode.id,
  };
};

const resolveTargetNodeId = (proposalId: string, nodeIdMap: Map<string, string>): string =>
  nodeIdMap.get(proposalId) ?? proposalId;

const resolveSourceNodeId = (
  proposalId: string,
  nodeIdMap: Map<string, string>,
  controlMergeNodeIdMap: Map<string, string>,
): string => {
  const realId = nodeIdMap.get(proposalId) ?? proposalId;
  return controlMergeNodeIdMap.get(realId) ?? realId;
};

const buildFromScratch = (
  currentNodes: Node[],
  proposal: GraphProposalDto,
): GraphProposalApplyResult => {
  const trigger = currentNodes.find((node) => node.type === "triggerNode") ?? createTriggerNode();
  const flowEnd = createSupportNodeObj("flowEndNode");

  const nodeIdMap = new Map<string, string>();
  const controlMergeNodeIdMap = new Map<string, string>();
  const nodes: Node[] = [trigger];
  const edges: Edge[] = [];
  const supportNodes: Node[] = [];
  const supportEdges: Edge[] = [];

  for (const operation of proposal.operations) {
    if (operation.type !== "addNode") continue;
    const spec = operation.node;

    if (CONTROL_NODE_TYPES.has(spec.type)) {
      const scaffold = createControlScaffold(spec);
      nodeIdMap.set(spec.id, scaffold.controlNodeId);
      controlMergeNodeIdMap.set(scaffold.controlNodeId, scaffold.mergeNodeId);
      supportNodes.push(...scaffold.nodes);
      supportEdges.push(...scaffold.edges);
      continue;
    }

    const realId = window.crypto.randomUUID();
    nodeIdMap.set(spec.id, realId);
    const node = createProposalNode(spec, realId);
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
        resolveSourceNodeId(operation.edge.source, nodeIdMap, controlMergeNodeIdMap),
        resolveTargetNodeId(operation.edge.target, nodeIdMap),
        operation.edge.sourceHandle,
        operation.edge.targetHandle,
      ),
    );
  }

  const incoming = new Set(edges.map((edge) => edge.target));
  const outgoing = new Set(edges.map((edge) => edge.source));
  const proposalNodeIds = [...nodeIdMap.values()];

  for (const rootId of proposalNodeIds.filter((id) => !incoming.has(id))) {
    edges.push(createProposalEdge(trigger.id, rootId));
  }
  for (const tailId of proposalNodeIds
    .map((id) => controlMergeNodeIdMap.get(id) ?? id)
    .filter((id) => !outgoing.has(id))) {
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
  const nodeIdMap = new Map<string, string>();
  const controlMergeNodeIdMap = new Map<string, string>();
  let nodes = [...currentNodes];
  let edges = [...currentEdges];

  for (const operation of proposal.operations) {
    if (operation.type !== "addNode") continue;
    const spec = operation.node;

    if (CONTROL_NODE_TYPES.has(spec.type)) {
      const scaffold = createControlScaffold(spec);
      nodeIdMap.set(spec.id, scaffold.controlNodeId);
      controlMergeNodeIdMap.set(scaffold.controlNodeId, scaffold.mergeNodeId);
      nodes.push(...scaffold.nodes);
      edges.push(...scaffold.edges);
      continue;
    }

    const realId = window.crypto.randomUUID();
    nodeIdMap.set(spec.id, realId);
    const node = createProposalNode(spec, realId);
    nodes.push(node);

    if (node.type === "aiNode") {
      const support = createAiSupportNode(realId);
      nodes.push(support.node);
      edges.push(support.edge);
    }
  }

  for (const operation of proposal.operations) {
    if (operation.type === "updateNode") {
      const realId = nodeIdMap.get(operation.node.id) ?? operation.node.id;
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
          resolveSourceNodeId(operation.edge.source, nodeIdMap, controlMergeNodeIdMap),
          resolveTargetNodeId(operation.edge.target, nodeIdMap),
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

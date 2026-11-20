import type { Edge, Node } from "@xyflow/react";

import type { FlowImportCanvas, FlowImportVariable } from "../types/flow-import.type";
import { validateImportedFlowGraph } from "./flow-import.util";

type ImportedNode = Node<Record<string, unknown>>;

const NODE_REFERENCE_KEYS = [
  "mergeBranchesNodeId",
  "defaultBranchNodeId",
  "customParentId",
  "groupId",
];

const remapNodeReference = (value: unknown, nodeIdMap: Map<string, string>) =>
  typeof value === "string" ? nodeIdMap.get(value) || value : value;

// IMPORTANT NOTE: copied from the Studio's import-flow remap, which the workspace app cannot
// import; like the Studio copy it validates the remapped graph, since the parser runs the same
// check before the agent is created and this copy repeats it after ids are reassigned.
/**
 * Gives an imported canvas fresh node and edge ids and repoints every reference to them.
 */
export const remapImportedFlowIds = (
  flow: FlowImportCanvas,
  flowVariablesObject: FlowImportVariable[],
) => {
  const nodeIdMap = new Map<string, string>();
  const edgeIdMap = new Map<string, string>();

  (flow.nodes as ImportedNode[]).forEach((node) =>
    nodeIdMap.set(node.id, globalThis.crypto.randomUUID()),
  );
  flow.edges.forEach((edge) => edgeIdMap.set(edge.id, globalThis.crypto.randomUUID()));

  const importedNodeIds = new Set(nodeIdMap.keys());

  const nodes = (flow.nodes as ImportedNode[]).map((node) => {
    const data = { ...node.data } as Record<string, unknown>;

    NODE_REFERENCE_KEYS.forEach((key) => {
      if (key in data) {
        const value = data[key];
        if (key === "groupId" && typeof value === "string" && !importedNodeIds.has(value)) {
          delete data[key];
        } else {
          data[key] = remapNodeReference(value, nodeIdMap);
        }
      }
    });

    if (Array.isArray(data.branches)) {
      data.branches = data.branches.map((branchId) => remapNodeReference(branchId, nodeIdMap));
    }

    if ("conditional2DefaultBranchEdgeId" in data) {
      const edgeRef = data.conditional2DefaultBranchEdgeId;
      data.conditional2DefaultBranchEdgeId =
        typeof edgeRef === "string" ? edgeIdMap.get(edgeRef) || edgeRef : edgeRef;
    }

    const parentId = remapNodeReference(node.parentId, nodeIdMap);

    return {
      ...node,
      id: nodeIdMap.get(node.id) || node.id,
      data,
      ...(typeof parentId === "string" ? { parentId } : {}),
    };
  });

  const remapMarkerEnd = (markerEnd: unknown, oldEdgeId: string, newEdgeId: string): unknown => {
    if (typeof markerEnd === "string") {
      return markerEnd.replace(oldEdgeId, newEdgeId);
    }
    if (markerEnd && typeof markerEnd === "object" && "id" in markerEnd) {
      const marker = markerEnd as { id?: string };
      if (marker.id === oldEdgeId) {
        return { ...marker, id: newEdgeId };
      }
    }
    return markerEnd;
  };

  const edges = flow.edges.map((edge) => {
    const newEdgeId = edgeIdMap.get(edge.id) || edge.id;
    const newEdge: Edge = {
      ...edge,
      id: newEdgeId,
      source: nodeIdMap.get(edge.source) || edge.source,
      target: nodeIdMap.get(edge.target) || edge.target,
    };

    if (edge.markerEnd !== undefined) {
      newEdge.markerEnd = remapMarkerEnd(edge.markerEnd, edge.id, newEdgeId) as Edge["markerEnd"];
    }

    return newEdge;
  });

  const remappedFlowVariablesObject = flowVariablesObject.map((flowVariable) => ({
    ...flowVariable,
    nodeId: nodeIdMap.get(flowVariable.nodeId) || flowVariable.nodeId,
  }));

  const graphError = validateImportedFlowGraph(
    (nodes as ImportedNode[]).map((node) => ({
      id: node.id,
      type: node.type,
      data: node.data as Record<string, unknown> | undefined,
    })),
    edges.map((edge) => ({ id: edge.id, source: edge.source, target: edge.target })),
  );
  if (graphError) throw new Error(graphError);

  return {
    reactFlowObject: { ...flow, nodes: nodes as Node[], edges },
    flowVariablesObject: remappedFlowVariablesObject,
  };
};

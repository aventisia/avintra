import { Edge, Node } from "@xyflow/react";

import { isValidFlowGraph } from "@/features/execute-flow/helpers/flow-validation-helper";

type ImportedNode = Node<Record<string, unknown>>;

type ImportedFlowVariables = {
  nodeId: string;
  outputs: string[];
};

type ImportedFlow = {
  nodes: ImportedNode[];
  edges: Edge[];
  viewport: unknown;
};

const NODE_REFERENCE_KEYS = [
  "mergeBranchesNodeId",
  "defaultBranchNodeId",
  "customParentId",
  "groupId",
];

const remapNodeReference = (value: unknown, nodeIdMap: Map<string, string>) =>
  typeof value === "string" ? nodeIdMap.get(value) || value : value;

const validateImportedFlowShape = (flow: ImportedFlow, variables: unknown[]) => {
  if (!Array.isArray(flow.nodes) || !Array.isArray(flow.edges)) {
    return "Invalid imported flow: nodes and edges must be arrays.";
  }
  if (!Array.isArray(variables)) {
    return "Invalid imported flow: flowVariablesObject must be an array.";
  }
  return null;
};

export const remapImportedFlowIds = (
  flow: ImportedFlow,
  flowVariablesObject: ImportedFlowVariables[],
) => {
  const variables = Array.isArray(flowVariablesObject) ? flowVariablesObject : [];

  const shapeError = validateImportedFlowShape(flow, variables);
  if (shapeError) {
    throw new Error(shapeError);
  }

  const nodeIdMap = new Map<string, string>();
  const edgeIdMap = new Map<string, string>();

  flow.nodes.forEach((node) => nodeIdMap.set(node.id, window.crypto.randomUUID()));
  flow.edges.forEach((edge) => edgeIdMap.set(edge.id, window.crypto.randomUUID()));

  const importedNodeIds = new Set(nodeIdMap.keys());

  const nodes = flow.nodes.map((node) => {
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

  const remappedFlowVariablesObject = variables.map((flowVariable) => ({
    ...flowVariable,
    nodeId: nodeIdMap.get(flowVariable.nodeId) || flowVariable.nodeId,
  }));

  const validationError = isValidFlowGraph(nodes as ImportedNode[], edges);
  if (validationError) {
    throw new Error(validationError);
  }

  return {
    reactFlowObject: { ...flow, nodes, edges },
    flowVariablesObject: remappedFlowVariablesObject,
  };
};

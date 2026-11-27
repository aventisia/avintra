import type { Edge, Node } from "@xyflow/react";

import type { FlowImportCanvas, FlowImportVariable } from "../types/flow-import.type";
import { validateImportedFlowGraph } from "./flow-import.util";

type ImportedNode = Node<Record<string, unknown>>;

const readGroupId = (data: unknown): string | undefined => {
  if (!data || typeof data !== "object") return undefined;
  const groupId = (data as Record<string, unknown>).groupId;
  return typeof groupId === "string" ? groupId : undefined;
};

const isTemporaryEdge = (edge: Edge): boolean =>
  (edge.data as Record<string, unknown> | undefined)?.isTemporary === true;

// IMPORTANT NOTE: group markers (`group-<timestamp>`, minted by Studio when nodes are grouped)
// are canvas-scoped ids like node and edge ids, not references to outside the canvas, so they get
// fresh values on import exactly like node and edge ids do. Temporary bypass edges keep the
// `temp-<group>-<target>` shape Studio's expand/collapse/ungroup cleanup matches on, so they are
// rewritten from their parts instead of getting unrelated UUIDs.
/**
 * Gives an imported canvas fresh node, edge, and group ids and rewrites every occurrence of the
 * old ids across the whole canvas, so the graph stays internally consistent without allowlisting
 * each id-carrying key.
 */
export const remapImportedFlowIds = (
  flow: FlowImportCanvas,
  flowVariablesObject: FlowImportVariable[],
) => {
  const nodeIdMap = new Map<string, string>();
  const edgeIdMap = new Map<string, string>();
  const groupIdMap = new Map<string, string>();

  const mintGroupId = (groupId: string) => {
    if (!groupIdMap.has(groupId)) {
      groupIdMap.set(groupId, `group-${Date.now()}-${groupIdMap.size}`);
    }
  };

  (flow.nodes as ImportedNode[]).forEach((node) => {
    nodeIdMap.set(node.id, globalThis.crypto.randomUUID());
    const groupId = readGroupId(node.data);
    if (groupId) mintGroupId(groupId);
  });

  flow.edges.forEach((edge) => {
    if (!isTemporaryEdge(edge)) edgeIdMap.set(edge.id, globalThis.crypto.randomUUID());
    const groupId = readGroupId(edge.data);
    if (groupId) mintGroupId(groupId);
  });

  const replacements = [...nodeIdMap, ...edgeIdMap, ...groupIdMap].sort(
    ([oldA], [oldB]) => oldB.length - oldA.length,
  );

  const remappedCanvas = JSON.parse(
    replacements.reduce(
      (json, [oldId, newId]) => json.split(oldId).join(newId),
      JSON.stringify(flow),
    ),
  ) as FlowImportCanvas;

  const remappedFlowVariablesObject = flowVariablesObject.map((flowVariable) => ({
    ...flowVariable,
    nodeId: nodeIdMap.get(flowVariable.nodeId) || flowVariable.nodeId,
  }));

  const graphError = validateImportedFlowGraph(
    (remappedCanvas.nodes as ImportedNode[]).map((node) => ({
      id: node.id,
      type: node.type,
      data: node.data as Record<string, unknown> | undefined,
    })),
    (remappedCanvas.edges as Edge[]).map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
    })),
  );
  if (graphError) throw new Error(graphError);

  return {
    reactFlowObject: remappedCanvas,
    flowVariablesObject: remappedFlowVariablesObject,
  };
};

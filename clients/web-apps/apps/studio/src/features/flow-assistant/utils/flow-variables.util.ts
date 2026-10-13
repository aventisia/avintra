import { Node } from "@xyflow/react";

import { FlowVariablesObjectType } from "@/types/flow-variables-object-type";
import { NodeDataType } from "@/types/node-data-type";

const collectEnabledOutputs = (node: Node): string[] | null => {
  const outputs = (node.data as NodeDataType)?.outputs;
  if (!outputs || outputs.length === 0) return null;
  return outputs
    .filter((output) => output.value.enabled)
    .map((output) => output.value.value.toString());
};

const sameOutputs = (current: string[], next: string[]): boolean =>
  current.length === next.length && current.every((value, index) => value === next[index]);

/**
 * Reflects each node's enabled outputs into the flow variables list.
 *
 * @param flowVariables Current flow variables.
 * @param nodes Nodes whose outputs should be reflected.
 */
export const applyOutputsToFlowVariables = (
  flowVariables: FlowVariablesObjectType[],
  nodes: Node[],
): FlowVariablesObjectType[] => {
  const outputsByNodeId = new Map<string, string[]>();
  for (const node of nodes) {
    const outputs = collectEnabledOutputs(node);
    if (outputs) outputsByNodeId.set(node.id, outputs);
  }

  if (outputsByNodeId.size === 0) return flowVariables;

  let changed = false;
  const nextVariables = flowVariables.map((item) => {
    const nextOutputs = outputsByNodeId.get(item.nodeId);
    if (!nextOutputs) return item;
    outputsByNodeId.delete(item.nodeId);
    if (sameOutputs(item.outputs, nextOutputs)) return item;
    changed = true;
    return { ...item, outputs: nextOutputs };
  });

  for (const [nodeId, outputs] of outputsByNodeId) {
    changed = true;
    nextVariables.push({ nodeId, outputs });
  }

  return changed ? nextVariables : flowVariables;
};

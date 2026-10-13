/**
 * A source of flow variables exposed in the variable selector.
 * Node-level entries use the React Flow node id; flow-level inputs use the
 * reserved sentinel node id `"__flow__"` because they belong to no single node.
 */
export type FlowVariablesObjectType = {
  nodeId: string;
  outputs: string[];
};

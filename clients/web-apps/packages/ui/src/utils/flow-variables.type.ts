/** A source of flow variables: a node id and the output names it exposes. */
export type FlowVariablesEntry = {
  nodeId: string;
  outputs: string[];
};

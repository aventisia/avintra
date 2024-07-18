/** To get flow props to load when user opens a flow in studio */
export interface LoadFlowDto {
  /** Flow record's primary key (Guid) */
  id: string;

  /** Flow's name */
  name: string;

  /** Flow's nodes json data */
  nodes: string;

  /** Flow's edges json data */
  edges: string;
}

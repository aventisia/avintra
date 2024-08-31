/** To get flow props to load when user opens a flow in studio */
export interface LoadFlowDto {
  /** Flow record's primary key (Guid) */
  id: string;

  /** Flow's name */
  name: string;

  /** Flow's nodes, edges, and viewport JSON data in string format */
  reactFlowObject: string;
}

/** To update flow's nodes, edges etc silently in the background */
export interface FlowSilentUpdateDto {
  /** Flow record's primary key (Guid) */
  id: string;

  /** Flow's nodes json data */
  nodes: string;

  /** Flow's edges json data */
  edges: string;
}

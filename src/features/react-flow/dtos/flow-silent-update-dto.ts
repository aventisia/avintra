/** To update flow's nodes, edges etc silently in the background */
export interface FlowSilentUpdateDto {
  /** Flow record's primary key (Guid) */
  id: string;

  /** Flow's nodes, edges, and viewport JSON data in string format */
  reactFlowObject: string;

  /** Flow Output variables */
  flowVariablesObject: string | null;
}

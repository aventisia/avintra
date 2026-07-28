/** To update flow's isPublished */
export interface PublishFlowDto {
  /** Flow record's primary key (Guid) */
  flowId: string;

  /** Flow's nodes, edges, and viewport JSON data in string format */
  reactFlowObject?: string;

  id: string;

  isPublished: boolean;

  accessType?: string;

  type?: string;

  flowVariablesObject?: string;

  inputOutputObject?: string;

  thumbnail?: string;

  Description?: string;
}

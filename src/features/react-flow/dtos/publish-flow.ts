/** To update flow's isPublished */
export interface PublishFlowDto {
  /** Flow record's primary key (Guid) */
  id: string;

  /** Flow's nodes, edges, and viewport JSON data in string format */
  reactFlowObject: string;

  versionId: string;

  isPublished: boolean;
}

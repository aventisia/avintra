export interface IProjectInfoDTO {
  /** Version id */
  versionId?: string;

  /** Version no */
  versionNumber?: number | null;

  /** Flow Name */
  name?: string;

  /** Flow Type */
  type?: string;
}

/** To get flow props to load when user opens a flow in studio */
export interface LoadFlowDto extends IProjectInfoDTO {
  /** Flow record's primary key (Guid) */
  id: string;

  /** Flow's name */
  name: string;

  /** Flow's nodes, edges, and viewport JSON data in string format */
  reactFlowObject: string;

  /** Output Variables object, i..e the Flow Variables */
  flowVariablesObject: string;

  isPublished?: boolean;
}

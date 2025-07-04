/** To get flow block props */
export interface FlowBlockDto {
  /** Flow record's primary key (Guid). FlowId */
  id: string;

  /** Flow's name */
  name: string;

  description?: string;

  type: string;

  /**Null for public tenant id for tenant level and flowId for Agent level */
  flowVersionId: string | null;

  isDisabled?: boolean;

  /** Flow's nodes, edges, and viewport JSON data in string format */
  reactFlowObject: string;

  /** Output Variables object, i..e the Flow Variables */
  flowVariablesObject: string;

  /** Flow's inputs outputs JSON data in string format */
  inputOutputObject?: string;

  /**
   * Gets or sets the username of the user who created the flow record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the flow record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the flow record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the flow record was last modified.
   */
  lastModifiedOn?: Date;
}

/**
 * Represents a data transfer object (DTO) for a single flow item.
 */
export interface PublishedAgentDto {
  /**
   * Gets or sets the primary key of the flow record.
   */
  id: string;

  /**
   * Gets or sets the identifier of the associated flow.
   */
  refId: string;

  /**
   * Gets or sets the name of the flow. Max-255
   */
  name: string;

  /**
   * Gets or sets the number of machines associated with this flow.
   */
  machineCount: number;

  /**
   * Gets or sets a flag indicating whether the flow is locked.
   */
  isLocked: boolean;

  /**
   * Gets or sets a flag indicating whether the flow is a draft.
   */
  isDraft: boolean;

  /**
   * Gets or sets a flag indicating whether the flow is published.
   */
  isPublished: boolean;

  /**
   * Gets or sets a flag indicating whether the flow is archived.
   */
  isArchived: boolean;

  /**
   * Gets or sets the full name of the user who created the flow.
   */
  createdBy: string;

  /**
   * Gets or sets the username/email of the user who created the flow.
   */
  createdByUsername: string;

  /**
   * Gets or sets the timestamp when the flow was created.
   */
  createdOn: Date;

  /**
   * Gets or sets the version number of the flow.
   */
  versionNumber: number;

  /**
   * Gets or sets the username/email of the user who last modified the flow.
   */
  lastModifiedBy: string | null;

  /**
   * Gets or sets the timestamp when the flow was last modified.
   */
  lastModifiedOn: Date;
}

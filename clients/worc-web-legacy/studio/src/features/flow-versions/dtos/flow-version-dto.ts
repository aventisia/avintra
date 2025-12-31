/**
 * Represents a data transfer object (DTO) for a flow version.
 */
export interface FlowVersionDto {
  /**
   * Gets or sets the primary key of the flow record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the ID of the flow this version is associated with.
   */
  flowId: string;

  /**
   * Gets or sets a value indicating whether the version is in draft state.
   */
  isDraft?: boolean;

  isPublished?: boolean;

  /**
   * Gets or sets a value indicating whether the version is in locked state.
   */
  isLocked?: boolean;
  /**
   * Gets or sets the username of the user who created the flow record
   */
  createdBy?: string;
  /**
   * Gets or sets the username of the user who created the flow record
   */
  createdByUsername?: string;

  /**
   * Gets or sets the date and time when the flow record was created.
   */
  createdOn?: Date;

  createdByUserInitials?: string;

  versionNumber?: number;
}

/**
 * Represents a data transfer object (DTO) for a Model version.
 */
export interface ModelVersionDto {
  /**
   * Gets or sets the primary key of the Model version.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  name?: string;
  /**
   * Gets or sets the ID of the model this version is associated with.
   */
  aiProjectId: string;

  businessContext: string;
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

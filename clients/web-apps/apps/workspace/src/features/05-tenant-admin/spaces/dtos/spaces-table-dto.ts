/**
 * Represents a data transfer object (DTO) for a space.
 */
export interface SpacesTableDto {
  /**
   * Gets or sets the primary key of the space record.
   *
   * Note: Not making it required because the same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the name of the space. Max-50.
   */
  name: string;

  /**
   * Gets or sets an optional description for the space. Max-250.
   */
  description?: string;

  /**
   * Gets or sets a value indicating whether the space is disabled.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets a value indicating whether the space is the system default.
   */
  isDefault?: boolean;

  /**
   * Gets or sets the total number of users associated with the space.
   */
  totalUsers?: number;

  /**
   * Gets or sets the total number of published agents in the space.
   */
  totalPublishedAgents?: number;

  /**
   * Gets or sets the total execution time (in seconds) for the space.
   */
  totalExecutionTime?: number;

  /**
   * Gets or sets the total number of machines attached to the space.
   */
  totalMachinesAttached?: number;

  /**
   * Gets or sets the username of the user who created the space record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the space record was created.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the space record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the space record was last modified.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedOn?: Date;
}

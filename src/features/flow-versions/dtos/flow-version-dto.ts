/**
 * Represents a data transfer object (DTO) for a flow version.
 */
export interface FlowVersionDto {
  /**
   * Gets or sets the primary key of the flow record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  Id?: string;

  /**
   * Gets or sets the ID of the flow this version is associated with.
   */
  FlowId: string;

  /**
   * Gets or sets a value indicating whether the version is in draft state.
   */
  IsDraft?: boolean;

  /**
   * Gets or sets a value indicating whether the version is in locked state.
   */
  IsLocked?: boolean;
  /**
   * Gets or sets the username of the user who created the flow record
   */
  CreatedBy?: string;
  /**
   * Gets or sets the username of the user who created the flow record
   */
  CreatedByUsername?: string;

  /**
   * Gets or sets the date and time when the flow record was created.
   */
  CreatedOn?: Date;

  CreatedByUserInitials?: string;

  VersionNumber?:number;
}

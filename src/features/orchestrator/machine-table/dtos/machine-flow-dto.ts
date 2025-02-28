/**
 * Represents a data transfer object (DTO) for a MachineFlowDto.
 */
export interface MachineFlowDto {
  /**
   * Gets or sets Id of the machine flow.
   */
  id?: string;

  /**
   * Gets or sets Id of the machine
   */
  machineId?: string;

  /**
   * Gets or sets Id of the tenant.
   */
  tenantId?: string;

  /**
   * Gets or sets Id of the flow version
   */
  flowVersionId?: string;

  /**
   * Gets or sets the name of the flow.
   */
  name: string;

  /**
   *
   * Gets or sets a flag indicating whether the user record is disabled.
   * Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the user record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdBy?: string;

  /**
   *
   * Gets or sets initials of the user who created the record
   */
  createdByUserInitials?: string;

  /**
   * Gets or sets the date and time when the user record was created.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the user record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the user record was last modified. 
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedOn?: Date;

  /**
   * Gets or sets the version number of a flow version record
   *  */
  versionNumber: number;
}

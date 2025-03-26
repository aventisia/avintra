/**
 * Represents a data transfer object (DTO) for a trigger.
 */
export interface TriggersTableDto {
  /**
   * Gets or sets the primary key of the trigger record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the name of the trigger. Max-255
   */
  name: string;

  /**
   * Gets or sets the process of the trigger. Max-255
   */
  process: string;

  /**
   * Gets or sets the job Priority of the trigger. Max-255
   */
  jobPriority: string;

  /**
   * Gets or sets the runtime Type of the trigger. Max-255
   */
  runtimeType: string;

  /**
   * Gets or sets the time Zone of the trigger. Max-255
   */
  timeZone: string;

  /**
   * Gets or sets the frequency of the trigger. Max-255
   */
  frequency: string;

  /**
   * Gets or sets the repeatation of the trigger. Max-255
   */
  repeateEvery: string;

  /**
   * Gets or sets the non-Working Days of the trigger. Max-255
   */
  nonWorkingDays: string;

  /**
   * Gets or sets the schedule Ending of the trigger.
   */
  scheduleEnding: boolean;

  /**
   * Gets or sets the schedule Auto Disabling of the trigger.
   */
  scheduleAutoDisabling: boolean;

  /**
   * Gets or sets the generate Stuck Alert of the trigger.
   */
  generateStuckAlert: boolean;

  /**
   * Gets or sets the generate Failed Alert of the trigger.
   */
  generateFailedAlert: boolean;

  /**
   * Gets or sets a flag indicating whether the trigger record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true; false and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the trigger record. Max-254
   */
  createdBy?: boolean;

  /**
   * Gets or sets the date and time when the trigger record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the trigger record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the trigger record was last modified.
   */
  lastModifiedOn?: Date;
}

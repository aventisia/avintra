/**
 * Represents a data transfer object (DTO) for an email trigger configuration.
 */
export interface MessageTriggerDto {
  /**
   * Gets or sets the unique identifier of the email trigger.
   */
  id: string;

  /**
   * Gets or sets the name of the email trigger.
   */
  name: string;

  /**
   * Gets or sets the timezone in which the email trigger operates.
   */
  timezone: string;
  reference?: string;
  resource: string;
  expiryDateTime: Date | string;
  resubscribeEnabled?: boolean;
  resubscribeFrequency?: number;
  subscriptionId?: string;

  credentialId: string;
  provider: string;
  /**
   * Gets or sets the collection of agent identifiers associated with the email trigger.
   */
  agents?: {
    is: string;
    name: string;
    versionNumber: number;
  }[];

  /**
   * Gets or sets a value indicating whether the email trigger is disabled.
   */
  isDisabled?: boolean | null;

  /**
   * Gets or sets the username of the user who created the email trigger record.
   * (Response only)
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the email trigger record was created.
   * ISO 8601 format
   */
  createdOn?: Date | string;

  /**
   * Gets or sets the username of the user who last modified the email trigger record.
   * (Response only)
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the email trigger record was last modified.
   * ISO 8601 format
   */
  lastModifiedOn?: Date | string;
}

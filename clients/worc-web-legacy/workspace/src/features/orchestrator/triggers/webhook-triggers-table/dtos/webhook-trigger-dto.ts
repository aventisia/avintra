/**
 * Represents a data transfer object (DTO) for an webhook trigger configuration.
 */
export interface WebhookTriggerDto {
  /**
   * Gets or sets the unique identifier of the webhook trigger.
   */
  id: string;

  /**
   * Gets or sets the name of the webhook trigger.
   */
  name: string;

  /**
   * Gets or sets the timezone in which the webhook trigger operates.
   */
  // timezone: string;

  webhookUrl?: string;

  apiKey: string;

  expectedPayloadSchema?: string;

  callbackUrl?: string;

  /**
   * Gets or sets the collection of agent identifiers associated with the webhook trigger.
   */
  agent: {
    id: string;
    name: string;
    versionNumber: number;
  };
  /**
   * Gets or sets a value indicating whether the webhook trigger is disabled.
   */
  isDisabled?: boolean | null;

  /**
   * Gets or sets the username of the user who created the webhook trigger record.
   * (Response only)
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the webhook trigger record was created.
   * ISO 8601 format
   */
  createdOn?: Date | string;

  /**
   * Gets or sets the username of the user who last modified the webhook trigger record.
   * (Response only)
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the webhook trigger record was last modified.
   * ISO 8601 format
   */
  lastModifiedOn?: Date | string;
}

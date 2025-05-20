/**
 * Represents a data transfer object (DTO) for a queue.
 */
export interface QueuesTableDto {
  /**
   * Gets or sets the primary key of the queue record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id: string;

  /**
   * Gets or sets the name of the queue.
   */
  name: string;

  /**
   * Gets the toatal peding work items in queue
   */
  totalPendingItems: number;

  /**
   * Gets or sets description for the queue
   */
  description: string;

  /**
   * Gets or sets the wheather queue Unique References Enforced.
   */
  isUniqueReferencesEnforced: boolean;

  /**
   * Gets or sets the wheather queue is Stored Encrypted
   */
  isStoredEncrypted: boolean;

  /**
   * Gets or sets the wheather queue should Retry Failed Items
   */
  shouldRetryFailedItems: boolean;

  /**
   * Gets or sets the wheather queue should Retry Abandoned Items
   */
  shouldRetryAbandonedItems: boolean;

  /**
   * Gets or sets the maximum Retry Attempts for work item
   */
  maximumRetryAttempts: number;

  /**
   * Gets the queue specific Data Schema Path and json string
   */
  specificDataSchemaPath: string;
  specificDataSchemaJsonString: string;

  /**
   * Gets the wheather queue output Data Schema Path and json string
   */
  outputDataSchemaPath: string;
  outputDataSchemaJsonString: string;

  /**
   * Gets or sets a flag indicating whether the credentials record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true, false and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the credentials record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the credentials record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the credentials record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the credentials record was last modified.
   */
  lastModifiedOn?: Date;
}

/**
 * Represents a data transfer object (DTO) for a queue create update operation.
 */
export interface QueueCreateUpdateDto {
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
   * Gets or sets the description of the queue.
   */
  description: string;

  /**
   * Gets or sets the wheather the queue has unique reference.
   */
  isUniqueReferencesEnforced: boolean;

  /**
   * Gets or sets the queue in encrypted format.
   */
  isStoredEncrypted: boolean;

  /**
   * Gets or sets the should retry the failed work itmes in queue.
   */
  shouldRetryFailedItems: boolean;

  /**
   * Gets or sets the should retry the abandoned work itmes in queue.
   */
  shouldRetryAbandonedItems: boolean;

  /**
   * Gets or sets the retry attemts for queue work items.
   */
  maximumRetryAttempts: number;

  /**
   * Gets or sets the schema file for input.
   */
  specificDataSchemaFile: File;

  /**
   * Gets or sets the schema file for output.
   */
  outputDataSchemaFile: File;

  /**
   * Gets or sets the disability of the queue.
   */
  isDisabled: boolean;
}

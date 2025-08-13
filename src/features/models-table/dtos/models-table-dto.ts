/**
 * Represents a data transfer object (DTO) for a model.
 */
export interface ModelsTableDto {
  /**
   * Gets or sets the primary key of the model record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the type of the model.
   */
  type: string; // TODO: Update enum values

  /**
   * Gets or sets the llm of the model.
   */
  llMs: string[]; // TODO: Update enum values

  /**
   * Gets or sets the name of the model. Max-255
   */
  name: string;

  /**
   * Gets or sets the description of the model.
   */
  description?: string;

  /**
   * Gets or sets the status of the model.
   */
  setupStatus?: string;

  /**
   * token count.
   */
  tokenCount?: number;

  /**
   * Execution count.
   */
  executionCount?: number;

  /**
   * Failed count.
   */
  failedCount?: number;

  /**
   * Total execution time.
   */
  executionTime?: number;

  /**
   * Gets or sets the accuracy of the model.
   */
  accuracy?: string;

  /**
   * Is the model published
   */
  isPublished?: boolean;

  /**
   * Gets or sets the description of the model. Max-500
   */
  docsProcessed?: number;

  /**
   * Gets or sets the date and time when the model record was created.
   */
  createdOn?: Date;

  /**
   * Gets the date on which model was published.
   */
  publishedOn?: Date;

  /**
   * Gets or sets the date and time when the model record was last modified.
   */
  trainedOn?: Date;

  /**
   * Gets or sets the tenant id.
   */
  tenantId?: string;

  /**
   * Gets or sets the created by id.
   */
  createdByUserId?: string;

  /**
   * Gets or sets the last modified by user id.
   */
  lastModifiedByUserId?: string;

  /**
   * Gets or sets the created by.
   */
  createdBy?: string;

  /**
   * Gets or sets the created by username.
   */
  createdByUsername?: string;
}

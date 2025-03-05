/**
 * Represents a data transfer object (DTO) for a model.
 */
export interface ModelLibraryTableDto {
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
  llm: string; // TODO: Update enum values

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
  status?: string;

  /**
   * Gets or sets the accuracy of the model.
   */
  accuracy?: string;

  /**
   * Gets or sets the description of the model. Max-500
   */
  docsProcessed?: number;

  /**
   * Gets or sets the date and time when the model record was created.
   */
  createdOn?: Date;

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

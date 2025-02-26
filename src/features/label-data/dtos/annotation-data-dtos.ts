/**
 * Represents a data transfer object (DTO) for a annotation data.
 */

export interface AnnotationDataDto {
  /**
   * Gets or sets the primary key of the model record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the llm of the model.
   */
  mlModelId?: string; // TODO: Update enum values

  /**
   * Gets or sets the name of the model. Max-255
   */
  uploadedDocId: string;

  /**
   * Gets or sets the description of the model. Max-500
   */
  annotationObject?: string;

  /**
   * Gets or sets the date and time when the model record was created.
   */
  createdOn?: Date;

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

/**
 * Represents a data transfer object (DTO) for a extracted data.
 */

export interface ExtractedDataDto {
  /**
   * Gets or sets the primary key of the model record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the model id.
   */
  mlModelId?: string;

  /**
   * Gets or sets the id of the file.
   */
  docId: string;

  /**
   * Gets or sets the data oject.
   */
  dataObject?: string;

  /**
   * Gets or sets the date and time when the model record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the accuracy of extraction.
   */
  accuracy?: number;

  /**
   * Gets or sets the name of the file.
   */
  docName: string;

  /**
   * Gets or sets the data fields name and value oject.
   */
  dynamicFields: Record<string, string>; // The dynamic fields (key-value pairs)
}

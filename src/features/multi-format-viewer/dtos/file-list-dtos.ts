/**
 * Represents a data transfer object (DTO) for a PdfViewerDto.
 */

export interface FileViewerDto {
  /**
   * Gets or sets the primary key of the pdf record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the type based on the stage at which doc is uploaded.
   */
  type?: "Testing" | "Training" | "RealData";

  /**
   * Gets or sets the model id.
   */
  mlModelId?: string;

  /**
   * Gets or sets the name of the file.
   */
  name: string;

  /**
   * Gets or sets the extension of the file.
   */
  extension?: string;

  /**
   * Gets or sets the path of the file.
   */
  path?: string;

  /**
   * Gets or sets the size of the file.
   */
  size?: number;

  /**
   * Gets or sets the date and time when the file was uploaded.
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

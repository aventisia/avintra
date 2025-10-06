/**
 * Represents a data transfer object (DTO) for a file upload.
 */

export interface FileUploadDto {
  /**
   * Gets or sets the primary key of the model record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  name?: string;

  path?: string;

  size?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  /**
   * Gets or sets the file.
   */
  file: File;

  extension?: string;

  type?: "setup" | "viewer";

  mlModelId?: string;

  aiProjectVersionId:string;
}

export interface DeleteFileResponseDto {
  success: boolean;
  message: string;
}

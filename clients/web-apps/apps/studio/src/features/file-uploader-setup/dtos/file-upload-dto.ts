/**
 * Represents a data transfer object (DTO) for a file upload.
 */

export interface FileUploadDto {
  name: string;

  path: string;

  size: number;

  extension: string;
}

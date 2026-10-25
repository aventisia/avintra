/**
 * Represents the payload used to update a folder.
 */
export interface UpdateFolderDto {
  /**
   * Gets or sets the unique identifier of the folder.
   */
  id: string;

  /**
   * Gets or sets the name of the folder. Max 50 characters.
   */
  name: string;

  /**
   * Gets or sets the description of the folder. Max 250 characters.
   */
  description?: string;

  /**
   * Gets or sets the palette color key of the folder. Max 20 characters.
   */
  color?: string;
}

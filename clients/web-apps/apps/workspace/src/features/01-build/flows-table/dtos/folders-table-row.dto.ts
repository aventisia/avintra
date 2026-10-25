/**
 * Represents folder data returned by the folder APIs.
 */
export interface FoldersTableRowDto {
  /**
   * Gets or sets the unique identifier of the folder.
   */
  id: string;

  /**
   * Gets or sets the name of the folder.
   */
  name: string;

  /**
   * Gets or sets the description of the folder.
   */
  description?: string;

  /**
   * Gets or sets the palette color key of the folder, or nothing when none was chosen.
   */
  color?: string;

  /**
   * Gets or sets the number of agents assigned to the folder, including archived agents and agents the caller cannot see.
   */
  flowCount: number;

  /**
   * Gets or sets the full name of the user who created the folder.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the folder was created.
   */
  createdOn: string;
}

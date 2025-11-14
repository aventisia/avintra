/**
 * Represents a data transfer object (DTO) for a Config Store.
 */
export interface ConfigVariablesDto {
  /**
   * Gets or sets the primary key of the keystore record.
   */
  id?: string;

  /**
   * Gets or sets the name of the keystore. Max-255
   */
  name: string;
}

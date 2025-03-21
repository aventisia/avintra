/**
 * Represents a data transfer object (DTO) for a config.
 */
export interface VaultsTableDto {
  /**
   * Gets or sets the primary key of the config record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the tenant id.
   */
  tenantId?: string;

  /**
   * Gets or sets the name of the config. Max-255
   */
  name: string;

  /**
 * Gets or sets the name of the config. Max-255
 */
  userName: string;

  /**
* Gets or sets the name of the config. Max-255
*/
  password: string;

  /**
   * Gets or sets a flag indicating whether the config record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true, false and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the config record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the config record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the config record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the config record was last modified.
   */
  lastModifiedOn?: Date;
}

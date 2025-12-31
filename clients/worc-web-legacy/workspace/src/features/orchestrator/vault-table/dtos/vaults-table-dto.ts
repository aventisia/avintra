import { VaultAppsEnum } from "../enums/vault-apps-enum";

/**
 * Represents a data transfer object (DTO) for a credentials.
 */
export interface VaultsTableDto {
  /**
   * Gets or sets the primary key of the credentials record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the name of the credentials. Max-255
   */
  name: string;

  /**
   * Gets or sets the type of the credentials. Max-255
   */
  type: VaultAppsEnum;

  /**
   * Gets or sets dynamic input fields as key-value pairs.
   * Values must be scalar types (string, number, boolean, or null).
   */
  data?: { [key: string]: string | number | boolean | null };

  /**
   * Gets or sets the description of the credentials. Max-255
   */
  description?: string;

  /**
   * Gets or sets a flag indicating whether the credentials record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true, false and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the credentials record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the credentials record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the credentials record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the credentials record was last modified.
   */
  lastModifiedOn?: Date;
}

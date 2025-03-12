import type { AccessLevelTypesEnum } from "@/react-toolkit/enums/access-level-types-enum";
import type { ConfigItemTypesEnum } from "@/react-toolkit/enums/config-item-types-enum";

/**
 * Represents a data transfer object (DTO) for a config.
 */
export interface ConfigsTableDto {
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
 * Gets or sets the type of the config.
 */
  type: ConfigItemTypesEnum;


  /**
   * Gets or sets the value of the config.
   */
  value: string;

  /**
   * Gets or sets the encryption state of the config.
   */
  isEncrypted: boolean;

  /**
   * Gets or sets the Access Level state of the config.
   */
  accessLevel: AccessLevelTypesEnum;

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

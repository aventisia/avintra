import type { AccessLevelTypesEnum } from "@/react-toolkit/enums/access-level-types-enum";
import type { KeyStoreTypesEnum } from "@/react-toolkit/enums/key-store-types-enum";

/**
 * Represents a data transfer object (DTO) for a keystore.
 */
export interface KeystoresTableDto {
  /**
   * Gets or sets the primary key of the keystore record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the tenant id.
   */
  tenantId?: string;

  /**
   * Gets or sets the name of the keystore. Max-255
   */
  name: string;

  /**
   * Gets or sets the type of the keystore.
   */
  type: KeyStoreTypesEnum;

  /**
   * Gets or sets the value of the keystore.
   */
  value: string;

  /**
   * Gets or sets the encryption state of the keystore.
   */
  isEncrypted: boolean;

  /**
   * Gets or sets the Access Level state of the keystore.
   */
  accessLevel: AccessLevelTypesEnum;

  /**
   * Gets or sets the description of the key.
   */
  description: string;

  /**
   * Gets or sets the tags of the key.
   */
  tags: string;

  /**
   * Gets or sets a flag indicating whether the keystore record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true, false and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the keystore record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the keystore record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the keystore record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the keystore record was last modified.
   */
  lastModifiedOn?: Date;
}

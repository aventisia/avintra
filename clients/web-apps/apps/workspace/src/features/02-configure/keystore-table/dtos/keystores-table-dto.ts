import type { KeyStoreTypesEnum } from "@avplatform/ui/enums/key-store-types-enum";

import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

/**
 * Represents a data transfer object (DTO) for a keystore.
 */
export interface KeystoresTableDto {
  /**
   * Gets or sets the primary key of the keystore record.
   *
   * Optional because same DTO is reused for create/update.
   */
  id?: string;

  /**
   * Tenant ID associated with the configuration item.
   *
   * Optional because same DTO is reused for create/update.
   */
  tenantId?: string;

  /**
   * Unique name for the configuration item.
   *
   * Max length: 256 characters.
   */
  name: string;

  /**
   * Description of the key store.
   *
   * Max length: 500 characters.
   */
  description?: string;

  /**
   * Type of the configuration item.
   */
  type: KeyStoreTypesEnum;

  /**
   * Value of the configuration item.
   */
  value: string;

  /**
   * Access level of the configuration item.
   */
  accessLevel: ResourceAccessTypeEnum;

  /**
   * Indicates whether the vault is accessible
   * to all users within the tenant.
   */
  isTenantWideAccess: boolean;

  /**
   * Indicates whether the record is disabled.
   *
   */
  isDisabled?: boolean;

  /**
   * Username of the record creator.
   *
   * Response only.
   */
  createdBy?: string;

  /**
   * Timestamp when the record was created.
   *
   * Response only.
   * ISO string from backend DateTimeOffset.
   */
  createdOn?: Date | string;

  /**
   * Username of the last modifier.
   *
   * Response only.
   */
  lastModifiedBy?: string;

  /**
   * Timestamp when the record was last modified.
   *
   * Response only.
   * ISO string from backend DateTimeOffset.
   */
  lastModifiedOn?: Date | string;
}

import type { AccessLevelTypesEnum } from "@/react-toolkit/enums/access-level-types-enum";
import type { KeyStoreTypesEnum } from "@/react-toolkit/enums/key-store-types-enum";

/**
 * Data Transfer Object (DTO) representing a key store.
 */
export interface KeystoresTableDto {
  /**
   * Configuration item ID.
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
  description?: string | null;

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
  accessLevel: AccessLevelTypesEnum;

  /**
   * Indicates whether the vault is accessible
   * to all users within the tenant.
   */
  isTenantWideAccess: boolean;

  /**
   * Indicates whether the record is disabled.
   *
   * Nullable to differentiate:
   * - true
   * - false
   * - null (unset)
   */
  isDisabled?: boolean | null;

  /**
   * Username of the record creator.
   *
   * Response only.
   */
  createdBy?: string | null;

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
  lastModifiedBy?: string | null;

  /**
   * Timestamp when the record was last modified.
   *
   * Response only.
   * ISO string from backend DateTimeOffset.
   */
  lastModifiedOn?: Date | string;
}

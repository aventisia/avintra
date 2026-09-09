import { ResourceAccessTypeEnum } from "@/features/resource-share/enums/resource-access-type-enum";

/**
 * Represents a data transfer object (DTO) for an app secret.
 */
export interface VaultsTableDto {
  /**
   * Gets or sets the unique identifier of the app secret.
   *
   * Optional because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the name of the secret.
   */
  name: string;

  /**
   * Gets or sets the type of the secret.
   * Used to determine the structure of the data field.
   * The backend accepts the enum name as a string (e.g. "CustomApiTool").
   */
  type: string;

  /**
   * Gets or sets the secret data.
   * Structure depends on the type.
   */
  data: Record<string, unknown>;

  /**
   * Gets or sets an optional description of the secret.
   */
  description?: string;

  /**
   * Gets or sets a value indicating whether
   * the app secret is accessible tenant-wide.
   */
  isTenantWideAccess?: boolean;

  /**
   * Gets or sets the permission level granted to the user.
   */
  accessLevel?: ResourceAccessTypeEnum;

  /**
   * Gets or sets a value indicating whether
   * the app secret is disabled.
   *
   * Nullable to differentiate between
   * true, false, and undefined.
   */
  isDisabled?: boolean | null;

  /**
   * Gets or sets the username of the user
   * who created the record.
   */
  createdBy?: string;

  /**
   * Gets or sets the creation date and time.
   */
  createdOn?: Date | string;

  /**
   * Gets or sets the username of the user
   * who last modified the record.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the last modified date and time.
   */
  lastModifiedOn?: Date | string;

  /**
   * Gets or sets the Corsair OAuth connect URL returned after create/update for
   * OAuth-capable credential types (e.g. M365). The frontend opens this URL to
   * complete OAuth consent.
   */
  oauthConnectUrl?: string;

  /**
   * Gets or sets a value indicating whether the OAuth connection has been
   * completed for OAuth-capable credential types.
   */
  oauthConnected?: boolean;

  corsairStatus?: "Connected" | "Failed" | "Expired" | "Pending" | "Unknown";

  corsairStatusReason?: string;

  /**
   * Gets or sets the list of space IDs this credential should be created in.
   * One credential record is created per selected space so the credential is
   * available in every selected space. The current space is always included
   * by default. For create requests only.
   *
   * The Central space is represented by the all-zero GUID
   * ("00000000-0000-0000-0000-000000000000").
   */
  spaceIds?: string[];
}

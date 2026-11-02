import { OnPremTenantTypes } from "../enums/on-prem-tenant-type-enum.ee";

/**
 * Represents a Data Transfer Object (DTO) for an on-premises tenant
 *
 */
export interface OnPremTenantDto {
  /** Unique identifier for the on-prem tenant  */
  id: string;

  /** Name of the tenant or organization */
  name: string;

  /** Type of tenant (Enterprise | Commercial) */
  type: OnPremTenantTypes;

  /**
   * Allowed execution time in multiples of 100.
   * Defines how long the tenant can execute platform processes.
   */
  executionTimeAllowed: number;

  /**
   * Total execution time consumed by the tenant.
   */
  consumedExecutionTime: number;

  /** Contract start date  */
  contractStartDate: string;

  /** Contract renewal date  */
  contractRenewalDate: string;

  /** Indicates whether execution is disabled for this tenant */
  isExecutionDisabled: boolean;

  /** Indicates whether login is disabled for this tenant */
  isLoginDisabled: boolean;

  /** Indicates whether single sign-on is allowed for this tenant */
  isSsoAllowed: boolean;

  /** Indicates whether custom branding is allowed for this tenant */
  isBrandingAllowed: boolean;

  /** Organization email address */
  ourEmails?: string | null;

  /** Tenant-provided email address */
  tenantEmails?: string | null;

  isAnyInstanceFailed?: boolean;

  /** User who created the tenant */
  createdByUser?: string | null;

  /** Timestamp when the tenant was created  */
  createdOn: string;

  /** User who last modified the tenant */
  lastModifiedByUser?: string | null;

  /** Timestamp when the tenant was last modified  */
  lastModifiedOn: string;
}

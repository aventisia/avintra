import { OnPremInstanceTypesEnum } from "../enums/tenant-instance-type-enum.ee";

/**
 * Represents a Data Transfer Object (DTO) for an on-premises instance
 */
export interface OnPremInstanceDto {
  /** Unique identifier for the instance */
  id: string;

  /** Name of the instance (e.g., "prod-instance", "staging-instance") */
  name: string;

  /** Instance type (Production | NonProduction) */
  type: OnPremInstanceTypesEnum;

  /** Platform version of the instance */
  platformVersion: string;

  /** Deployment date */
  deployedOn: string;

  /** Last validation date */
  lastValidatedOn: string;

  /**
   * Number of invalid checks performed on the instance
   */
  noOfInvalidCheck: number;

  /** ID referencing the related OnPremTenant */
  onPremTenantId: string;

  isDisabled?: boolean;
}

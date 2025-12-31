import { LicenseCreditStatusesEnum } from "@/react-toolkit/enums/license-credit-status-enum";
import { PricingUnitTypesEnum } from "@/react-toolkit/enums/pricing-unit-types-enum";

/**
 * Represents a data transfer object (DTO) for a license.
 */
export interface MyLicensesTableDto {
  /**
   * Gets or sets the primary key of the license record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id: string;

  /**
   * get the plan Id of the license plan
   */
  planId: string;

  /**
   * get the plan Name of the license plan
   */
  pricingComponent: string;

  /**
   * get the allocated units of the license plan
   */
  allocated: number;

  /**
   * get the consumed units of the license plan
   */
  consumed: number;

  /**
   * get the available units of the license plan
   */
  available: number;

  /**
   * Gets the plan unit.
   *
   */
  unit: PricingUnitTypesEnum;

  /**
   * Gets  the plan unit price.
   *
   */
  unitPrice: number;

  /**
   * Gets  the currency of unit.
   *
   */

  currency: string;

  /**
   * get the additional requested units for the license plan
   */
  additionalUnitsRequested: number;

  /**
   * get the status of the requested units
   */
  status: LicenseCreditStatusesEnum;

  /**
   * get the overdue balance of the license plan
   */
  overdueBalance: number;

  /**
   * get the  next billing date of the plan
   */
  nextBillingDate: Date;

  /**
   * Gets or sets a flag indicating whether the license record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true, false and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the license record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the license record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the license record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the license record was last modified.
   */
  lastModifiedOn?: Date;
}

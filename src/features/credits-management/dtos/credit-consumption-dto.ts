import { CreditServiceTypesEnum } from "../constants/credit-service-type-enum";

/**
 * Represents a data transfer object (DTO) for Credit Consumption.
 */
export interface CreditConsumptionDto {
  /**
   * Gets or sets the type of service being used, based on the available credit-based services.
   */
  serviceType: CreditServiceTypesEnum;

  /**
   * Gets or sets the number of consumed units for the service.
   */
  consumedUnit: number;

  /**
   * Gets or sets the reference type (e.g., AIModel) associated with the usage.
   */
  refType: string;

  /**
   * Gets or sets the unique identifier for the reference object.
   */
  refId: string;

  /**
   * Gets or sets the name of the reference object (e.g., Test AIModel).
   */
  refName: string;
}

import { ActionTypesEnum } from "../constants/action-types-enum";
import { CreditServiceTypesEnum } from "../constants/credit-service-type-enum";
import { UsageSourceTypesEnum } from "../constants/usage-source-types-enum";

/**
 * Represents a data transfer object (DTO) for Credit Consumption.
 */
export interface CreditConsumptionDto {
  /**
   * Gets or sets the type of service being used, based on the available credit-based services.
   */
  serviceType: CreditServiceTypesEnum | string;

  /**
   * Gets or sets the number of consumed units for the service.
   */
  consumedUnit: number;

  /**
   * Gets or sets the reference type (e.g.Agent, Platform) associated with the usage.
   */
  refType: UsageSourceTypesEnum | string;

  /**
   * Gets or sets the unique identifier for the reference object.
   */
  refId: string;

  /**
   * Gets or sets the name of the reference object (e.g., my_new_agent).
   */
  refName: string;

  /**
   * Gets or sets the action type (e.g.AgentExecution) associated with the usage.
   */
  action: ActionTypesEnum | string;

  /**
   * Gets or sets the name of the agent that consumed the credits.
   */
  triggeredByAgent: string;
}

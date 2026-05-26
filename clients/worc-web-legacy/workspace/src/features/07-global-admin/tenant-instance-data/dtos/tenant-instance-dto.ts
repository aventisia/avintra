import { ValidationSourceTypesEnum } from "../enums/validation-source-type-enum";

// DTO interface
export interface OnPremInstanceDataDto {
  /** Unique identifier for the instance data record */
  id: string;

  /** Timestamp when the instance was validated */
  validatedOn: Date | string;

  /** Source that validated the instance */
  validatedBy: ValidationSourceTypesEnum;

  /** Number of jobs executed during validation */
  executedJobs: number;

  /** Total execution time for validation jobs */
  executionTime: number;

  /** Number of users involved during validation */
  users: number;

  /** Number of agents published during validation */
  publishedAgents: number;

  /** ID linking to OnPremInstance */
  onPremInstanceId: string;
}

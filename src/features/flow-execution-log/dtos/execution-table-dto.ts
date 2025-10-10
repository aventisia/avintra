import { ExecutionStatusTypesEnum } from "../constants/execution-status-type-enum";

/**
 * Represents a data transfer object (DTO) for a execution.
 */
export interface ExecutionsTableDto {
  /**
   * Gets or sets the primary key of the execution record.
   *
   * Not making it required because the same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the tenantId.
   *
   * Not making it required because the same DTO is used for insert and update.
   */
  tenantId?: string;

  /**
   * Gets or sets the flowVersionId.
   *
   * Not making it required because the same DTO is used for insert and update.
   */
  flowVersionId: string;

  /**
   * Gets or sets the name of the execution. Max-255
   */
  name: string;

  /**
   * Gets or sets the number of retry counts in the execution.
   */
  retryCount?: number;

  /**
   * Gets or sets the status of the execution.
   */
  status: ExecutionStatusTypesEnum;

  /**
   * Gets or sets the last update time of the execution.
   */
  endTime: Date;

  /**
   * Gets or sets the start time of the execution.
   */
  startTime: Date;

  /**
   * Gets or sets the duration of the execution in seconds (number format).
   */
  duration: number;

  /**
   * Gets or sets the version number.
   */
  version: number;

  /**
   * Gets or sets a flag indicating whether the execution record is disabled.
   *
   * Not making it required because the same DTO is used for insert and update.
   *
   * Important to have this property nullable because we need to differentiate between true, false, and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets the username of the user who created the execution record. Max-254
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the execution record was created.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the execution record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the execution record was last modified.
   */
  lastModifiedOn?: Date;

  /**
   * Gets or sets the error message (if any) related to the execution.
   */
  errorMessage?: string;

  /**
   * Gets or sets the flow ID associated with the execution.
   */
  flowId: string;

  /**
   * Gets or sets the username of the user who executed the execution. Max-254
   */
  executedBy: string;

  /**
   * Gets or sets the date and time when the execution was executed.
   */
  executedOn: Date;

  /**
   * Gets or sets the type of execution (e.g., Scheduler).
   */
  executionType: string;

  /**
   * Gets or sets the logs related to the action execution. Can be null.
   */
  actionExecutionLogs?: string | null; // Could be null, empty, or a string
}

import type { ExecutionStatusTypesEnum } from "@/react-toolkit/enums/execution-status-type-enum";

/**
 * Represents a data transfer object (DTO) for a execution.
 */
export interface ExecutionsTableDto {
  /**
   * Gets or sets the primary key of the execution record.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the tenantId.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  tenantId?: string;

  /**
   * Gets or sets the tenantId.
   *
   * Not making it required because same DTO is used for insert and update.
   */
  flowVersionId?: string;

  /**
   * Gets or sets the name of the execution. Max-255
   */
  name: string;

  /**
   * Gets or sets the number of retry count in the execution.
   */
  retryCount?: number;

  /**
   * Gets or sets the status of the execution.
   */
  status: ExecutionStatusTypesEnum;

  /**
   * Gets or sets last update time of the execution.
   */
  endTime: Date;

  /**
   * Gets or sets last update time of the execution.
   */
  startTime: Date;

  /**
   * Gets or sets last update time of the execution.
   */
  duration: string;

  /**
   * Gets or sets version number .marker:
   */
  versionNumber: number;

  /**
   * Gets or sets a flag indicating whether the execution record is disabled.
   *
   * Not making it required because same DTO is used for insert and update.
   *
   * Its important to have this property nullable because we need to differentiate between true; false and null.
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
}

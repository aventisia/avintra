import type { ExecutionStateType } from "@/features/execute-flow/types/execution-state-type";

/**
 * Data transfer object for selecting flow versions to assign to a machine.
 *
 * @export
 * @interface SelectAgentTableDto
 */
export interface SelectAgentTableDto {
  /**
   * Gets or sets the flow version identifier.
   * @type { string}
   * @memberof SelectAgentTableDto
   */
  id: string;
  /**
   * Gets or sets the tenant identifier.
   * @type { string}
   * @memberof SelectAgentTableDto
   */
  tenantId: string;
  /**
   * Gets or sets the machine identifier.
   * @type { string}
   * @memberof SelectAgentTableDto
   */
  machineId: string;
  /**
   * Gets or sets the flow name.
   * @type { string}
   * @memberof SelectAgentTableDto
   */
  name: string;
  /**
   * Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
   * @type { boolean}
   * @memberof SelectAgentTableDto
   */
  isDisabled: boolean;
  /**
   * This property is intended for use in responses only and should not be included in requests.
   * @type { string}
   * @memberof SelectAgentTableDto
   */
  createdBy: string;
  /**
   * This property is intended for use in responses only and should not be included in requests.
   * @type { Date}
   * @memberof SelectAgentTableDto
   */
  createdOn: Date;
  /**
   * This property is intended for use in responses only and should not be included in requests.
   * @type { string}
   * @memberof SelectAgentTableDto
   */
  lastModifiedBy: string;
  /**
   * This property is intended for use in responses only and should not be included in requests.
   * @type { Date}
   * @memberof SelectAgentTableDto
   */
  lastModifiedOn: Date;
  /**
   * Gets or sets initials of the user who created the record
   * @type { string}
   * @memberof SelectAgentTableDto
   */
  createdByUserInitials: string;
  /**
   * Gets or sets the flow version number.
   * @type { number}
   * @memberof SelectAgentTableDto
   */
  versionNumber: number;
  /**
   * Gets or sets a value indicating whether the flow version is assigned.
   * @type { boolean}
   * @memberof SelectAgentTableDto
   */
  isAssigned: boolean;

  /**
   * Gets or sets the execution status of the flow version on the selected machine.
   */
  status: ExecutionStateType;

  jobId?: string;
}

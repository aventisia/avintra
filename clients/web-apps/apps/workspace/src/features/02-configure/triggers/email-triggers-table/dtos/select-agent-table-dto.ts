/**
 * data transfer object for select agent to assign to the machine.
 *
 * @export
 * @interface AssignAgentDto
 */
export interface SelectAgentTableDto {
  /**
   * Gets or sets Id of the machine flow.
   * @type { string}
   * @memberof AssignAgentDto
   */
  id: string;
  /**
   * Gets or sets Id of the tenant.
   * @type { string}
   * @memberof AssignAgentDto
   */
  tenantId: string;
  /**
   * </summary>
   * @type { string}
   * @memberof AssignAgentDto
   */
  triggerId: string;
  /**
   * Gets or sets the name of the flow.
   * @type { string}
   * @memberof AssignAgentDto
   */
  name: string;
  /**
   * Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
   * @type { boolean}
   * @memberof AssignAgentDto
   */
  isDisabled: boolean;
  /**
   * This property is intended for use in responses only and should not be included in requests.
   * @type { string}
   * @memberof AssignAgentDto
   */
  createdBy: string;
  /**
   * This property is intended for use in responses only and should not be included in requests.
   * @type { Date}
   * @memberof AssignAgentDto
   */
  createdOn: Date;
  /**
   * This property is intended for use in responses only and should not be included in requests.
   * @type { string}
   * @memberof AssignAgentDto
   */
  lastModifiedBy: string;
  /**
   * This property is intended for use in responses only and should not be included in requests.
   * @type { Date}
   * @memberof AssignAgentDto
   */
  lastModifiedOn: Date;
  /**
   * Gets or sets initials of the user who created the record
   * @type { string}
   * @memberof AssignAgentDto
   */
  createdByUserInitials: string;
  /**
   * Gets or sets the version number of a flow version record
   * @type { number}
   * @memberof AssignAgentDto
   */
  versionNumber: number;
  /**
   * Gets or sets a value indicating whether the flow version is assigned.
   * @type { boolean}
   * @memberof AssignAgentDto
   */
  isAssigned: boolean;
}

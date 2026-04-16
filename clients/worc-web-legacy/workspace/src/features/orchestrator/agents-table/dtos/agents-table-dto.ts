/**
 * data transfer object for the agents table
 * @export
 * @interface AgentsTableDto
 */
export interface AgentsTableDto {
  /**
   *  Gets or sets the ID of the flow this version is associated with.
   * @type {string}
   * @memberof AgentsTableDto
   */
  id: string;

  /**
   *  Gets or sets the ID of the flow this version is associated with.
   * @type {string}
   * @memberof AgentsTableDto
   */
  refId: string;

  type: string;

  /**
   *  Gets or sets the name of the flow.
   * @type {string | null}
   * @memberof AgentsTableDto
   */
  name: string | null;

  /**
   *  Gets or sets the license Type of the flow.
   * @type {string | null}
   * @memberof AgentsTableDto
   */
  licenseId: string | null;

  /**
   *  Gets or sets a value indicating whether the version is in locked state.
   * @type {boolean}
   * @memberof AgentsTableDto
   */
  isActive: boolean;

  /**
   *  Gets or sets a value indicating whether the version is in locked state.
   * @type {boolean}
   * @memberof AgentsTableDto
   */
  isLocked: boolean;

  /**
   *  Gets or sets a value indicating whether the version is in draft state.
   * @type {boolean}
   * @memberof AgentsTableDto
   */
  isDraft: boolean;

  /**
   *  Gets or sets a value indicating whether the version has been published.
   * @type {boolean}
   * @memberof AgentsTableDto
   */
  isPublished: boolean;

  isAssignedToAllUsers?: boolean;
  /**
   *  Gets or sets a value indicating whether the version has been archived.
   * @type {boolean}
   * @memberof AgentsTableDto
   */
  isArchived: boolean;

  supportedPlatform?: string;

  /**
   *  Gets or sets a value indicating whether the version has been disabled.
   * @type {boolean}
   * @memberof AgentsTableDto
   */
  isDisabled: boolean;

  /**
   *  Gets or sets the the user who created the record.
   * @type {string | null}
   * @memberof AgentsTableDto
   */
  createdBy: string | null;

  /**
   *  Gets or sets the the username who created the record.
   * @type {string | null}
   * @memberof AgentsTableDto
   */
  createdByUsername: string | null;

  /**
   *  Gets or sets the date and time when the record was created.
   * @type {Date}
   * @memberof AgentsTableDto
   */
  createdOn: Date;

  /**
   *  Gets or sets initials of the user who created the record
   * @type {string | null}
   * @memberof AgentsTableDto
   */
  createdByUserInitials: string | null;

  /**
   *  Gets or sets the version number of a flow version record
   * @type {number}
   * @memberof AgentsTableDto
   */
  versionNumber: number;

  /**
   * Gets or sets the username of the user who last agent the machine record. Max-254
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the agent record was last modified.
   */
  lastModifiedOn?: Date;

  /**
   * Gets the count of the machines using the agent.
   */
  machineCount?: number;
}

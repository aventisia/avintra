/**
 * Represents a data transfer object (DTO) for an account role.
 */
export interface RolesTableDto {
  /**
   * Gets or sets the primary key of the role record.
   *
   * Note: Not making it required because the same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the first name of the role. Max-50.
   */
  firstName: string;

  /**
   * Gets or sets the last name of the role. Max-50.
   */
  lastName: string;

  /**
   * Gets or sets the email/rolename of the role. Max-254.
   */
  email: string;

  /**
   * Gets or sets the list of role roles (role names).
   */
  roleRoles: string[];

  /**
   * Gets or sets a flag indicating if two-factor authentication is enabled for the role.
   */
  twoFactorEnabled: boolean;

  /**
   * Gets or sets the date and time, in UTC, when the role lockout ends.
   */
  lockoutEnd?: Date;

  /**
   * Gets or sets a flag indicating whether the role record is disabled.
   *
   * Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets a flag indicating if a role has confirmed their email address. Read-only.
   */
  emailConfirmed?: boolean;

  /**
   * Gets or sets the date and time when the password was last set/reset/updated by the role. Read-only.
   */
  pwdSetOn?: Date;

  /**
   * Gets or sets the rolename of the role who created the role record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the role record was created.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdOn?: Date;

  /**
   * Gets or sets the rolename of the role who last modified the role record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the role record was last modified.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedOn?: Date;
}

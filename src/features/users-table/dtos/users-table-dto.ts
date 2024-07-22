/**
 * Represents a data transfer object (DTO) for an account user.
 */
export interface UsersTableDto {
  /**
   * Gets or sets the primary key of the user record.
   *
   * Note: Not making it required because the same DTO is used for insert and update.
   */
  id?: string;

  /**
   * Gets or sets the first name of the user. Max-50.
   */
  firstName: string;

  /**
   * Gets or sets the last name of the user. Max-50.
   */
  lastName: string;

  /**
   * Gets or sets the email/username of the user. Max-254.
   */
  email: string;

  /**
   * Gets or sets the list of user roles (role names).
   */
  userRoles: string[];

  /**
   * Gets or sets a flag indicating if two-factor authentication is enabled for the user.
   */
  twoFactorEnabled: boolean;

  /**
   * Gets or sets the date and time, in UTC, when the user lockout ends.
   */
  lockoutEnd?: Date;

  /**
   * Gets or sets a flag indicating whether the user record is disabled.
   *
   * Note: It's important to have this property nullable because we need to differentiate between true, false, and null.
   */
  isDisabled?: boolean;

  /**
   * Gets or sets a flag indicating if a user has confirmed their email address. Read-only.
   */
  emailConfirmed?: boolean;

  /**
   * Gets or sets the date and time when the password was last set/reset/updated by the user. Read-only.
   */
  pwdSetOn?: Date;

  /**
   * Gets or sets the username of the user who created the user record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdBy?: string;

  /**
   * Gets or sets the date and time when the user record was created.
   * This property is intended for use in responses only and should not be included in requests.
   */
  createdOn?: Date;

  /**
   * Gets or sets the username of the user who last modified the user record.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedBy?: string;

  /**
   * Gets or sets the date and time when the user record was last modified.
   * This property is intended for use in responses only and should not be included in requests.
   */
  lastModifiedOn?: Date;
}

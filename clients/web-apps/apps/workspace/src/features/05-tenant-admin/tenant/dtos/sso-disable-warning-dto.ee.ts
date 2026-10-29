/**
 * Represents the non-blocking warning returned when single sign-on is disabled while passwordless users exist.
 */
export interface SsoDisableWarningDto {
  /**
   * Gets or sets a flag indicating whether the warning is informational only (disable always succeeds).
   */
  warnOnly: boolean;

  /**
   * Gets or sets the email addresses of active tenant admins without a password.
   */
  affectedAdmins: string[];

  /**
   * Gets or sets the number of users of the tenant without a password.
   */
  affectedUserCount: number;

  /**
   * Gets or sets the recovery hint describing how affected users regain access.
   */
  recoveryHint: string | null;
}

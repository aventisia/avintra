/** To make pwd update request from user account's settings area only if user is logged in */
interface PwdUpdateDto {
  /** User's current active password */
  oldPwd: string;

  /** New password for the user account. Min 8 char. Max 16 char. */
  newPwd: string;

  /** Boolean to state whether user wants to log off from all other active sessions */
  logoffFromOtherSessions: boolean;
}

export { type PwdUpdateDto };

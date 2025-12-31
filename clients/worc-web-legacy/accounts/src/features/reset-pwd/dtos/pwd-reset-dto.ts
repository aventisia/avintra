/**
 * To make pwd reset request.
 *
 * Note: UserName will be extracted from the Jwt (AccessToken cookie) which will be available via cookies
 */
interface PwdResetDto {
  /** New password for the user account. Min-8, Max-16 */
  newPwd: string;

  /** Boolean to state whether user wants to log off from all other active sessions */
  logoffFromAllSessions: boolean;
}

export { type PwdResetDto };

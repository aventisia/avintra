/**
 * To make a password reset request. The username comes from the JWT (AccessToken cookie) that a
 * verified reset code sets.
 */
interface PwdResetDto {
  /** New password for the user account. Min-8, Max-16 */
  newPwd: string;

  /** Whether to sign out of every other active session */
  logoffFromAllSessions: boolean;
}

export { type PwdResetDto };

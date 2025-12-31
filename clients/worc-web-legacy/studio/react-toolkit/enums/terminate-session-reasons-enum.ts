/**
 * Enum represents the reasons for terminating a session.
 * IMPORTANT NOTE: Any changes to this file should be manually synced with back-end enum file.
 */
export enum TerminateSessionReasonsEnum {
  UserHasLoggedOff = "User has logged off",
  SessionTerminatedByUser = "Session terminated by user",
  SessionHasExpired = "Session has expired",
}

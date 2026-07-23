/** To make request to terminate user's any session or sessions */
interface TerminateSessionDto {
  /** Remark on why session was terminated. Following are the options:
   * "User has logged off", "Session terminated by user", "Session has expired"
   */
  howSessionEnded: string;

  /** List of session id those needs terminations */
  sessionIdList: string[];
}

export { type TerminateSessionDto };

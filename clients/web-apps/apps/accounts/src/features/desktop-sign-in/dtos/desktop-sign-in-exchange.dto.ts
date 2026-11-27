/** The request that exchanges a desktop sign-in code for a session. */
interface DesktopSignInExchangeDto {
  code: string;
  state: string;
  codeVerifier: string;
}

export type { DesktopSignInExchangeDto };

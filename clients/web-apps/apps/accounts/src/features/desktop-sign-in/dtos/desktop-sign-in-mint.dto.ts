/** The request that starts one desktop sign-in attempt. */
interface DesktopSignInMintDto {
  state: string;
  codeChallenge: string;
  redirectUri: string;
}

export type { DesktopSignInMintDto };

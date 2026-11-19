import type { UserSessionDto } from "./user-session-dto";

/** Public outcome of a social sign-in attempt */
interface SocialCallbackDto {
  /** Outcome: SignedIn, TwoFARequired, LinkCodeRequired or SsoRequired */
  status: string;

  /** Issued session when the outcome is SignedIn */
  userSession: UserSessionDto | null;

  /** Verification code the client must confirm for the TwoFARequired and LinkCodeRequired outcomes */
  verificationCodeId: string | null;

  /** Account email the code was sent to */
  email: string | null;

  /** Provider name the person used */
  provider: string | null;

  /** Single sign-on URL the person must continue with for the SsoRequired outcome */
  ssoLoginUrl: string | null;

  /** Same-origin path to return to after sign-in */
  redirectUrl: string | null;

  /** Whether the person arrived with a paid plan chosen */
  hasPlanIntent: boolean;
}

export { type SocialCallbackDto };

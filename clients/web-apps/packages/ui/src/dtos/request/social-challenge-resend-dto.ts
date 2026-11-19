/** To request a fresh two-step verification code for an outstanding social attempt */
interface SocialChallengeResendDto {
  /** Primary key of the verification code issued with the callback */
  verificationCodeId: string;

  /** Account email the code was sent to */
  email: string;

  /** Provider name the attempt belongs to */
  provider: string;
}

export { type SocialChallengeResendDto };

/** To request to confirm the one-time code that links a social provider account */
interface SocialLinkVerifyDto {
  /** Primary key of the verification code issued with the callback */
  verificationCodeId: string;

  /** The verification code or OTP provided by the user */
  secretCode: string;
}

export { type SocialLinkVerifyDto };

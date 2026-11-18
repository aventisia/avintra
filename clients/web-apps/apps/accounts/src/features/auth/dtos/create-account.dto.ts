/** To make a new account create request */
interface CreateAccountDto {
  /** User's email/username */
  email: string;

  /** Password for the user account. Min-8, Max-16 */
  pwd: string;

  /** Primary key of the verification code db record */
  verificationCodeId: string;

  /** The verification code or OTP provided by the user */
  secretCode: string;

  /** Whether this sign-up is done with a social account rather than manually */
  isSocialSignUp: boolean;
}

export { type CreateAccountDto };

/** To make new account create request */
interface CreateAccountDto {
  /** User's email/username */
  email: string;

  /** Password for the user account. Min-8, Max-16 */
  pwd: string;

  /** Primary key of verificaiton code db record */
  verificationCodeId: string;

  /** The verification code or OTP provided by user */
  secretCode: string;

  /** Boolean to states whether this sign up is being done by any social account or manually */
  isSocialSignUp: boolean;
}

export { type CreateAccountDto };

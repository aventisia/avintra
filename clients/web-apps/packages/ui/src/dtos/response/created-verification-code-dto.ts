/** To receive newly created verification code/OTP as response */
interface CreatedVerificationCodeDto {
  /** Primary key of verificaiton code db record */
  verificationCodeId: string;

  /** Email/username of the account who has requested for code */
  email: string;

  /** The purpose for which code will be generated. Options are:
   * VerifyEmailAddress, TwoFA, ResetPwd, UpdatePwd, UnlockAccount */
  requestType: string;
}

export { type CreatedVerificationCodeDto };

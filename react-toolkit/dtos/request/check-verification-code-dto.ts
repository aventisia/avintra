/** To request to validate verification code/OTP */
interface CheckVerificationCodeDto {
  /** Primary key of verificaiton code db record */
  verificationCodeId: string;

  /** Email/username of user for whom code was generated */
  email: string;

  /** The purpose for which code will be generated. Options are:
   * VerifyEmailAddress, TwoFA, ResetPwd, UpdatePwd, UnlockAccount */
  requestType: string;

  /** The verification code or OTP provided/entered by user */
  secretCode: string;
}

export { type CheckVerificationCodeDto };

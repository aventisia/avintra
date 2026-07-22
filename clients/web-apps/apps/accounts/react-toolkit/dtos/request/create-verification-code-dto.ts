/** To request to create new verificaiton code/OTP */
interface CreateVerificationCodeDto {
  /** Email/username of the account who is requesting for the code */
  email: string;

  /** The purpose for which code will be generated. Options are (Two2FA, UpdatePwd options forbidden):
   * VerifyEmailAddress, ResetPwd, UnlockAccount */
  requestType: string;
}

export { type CreateVerificationCodeDto };

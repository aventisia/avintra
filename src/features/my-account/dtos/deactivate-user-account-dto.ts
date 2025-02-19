export interface DeactivateUserAccountDto {
  password: string;
  verificationCodeId: string;
  /// Gets or sets the verification code or OTP (One-Time Password) provided by the user.
  secretCode: string,
}

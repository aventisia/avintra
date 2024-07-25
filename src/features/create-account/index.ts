// dtos
export type { CreateAccountDto } from "./dtos/create-account-dto";

// apis
export { createAccount } from "./apis/create-account-apis";

// types
export type { ICreateAccountData } from "./types/create-account-data";
export type { IVerifyEmailData } from "./types/verify-email-data";

// constants
export {
  firstNameProps,
  lastNameProps,
  emailProps,
  pwdProps,
  confirmPwdProps,
  verificationCodeProps,
} from "./constants/form-field-props";
export { verifyEmailZodSchema } from "./constants/verify-email-zod-schema";
export { emailSchema, createAccountZodSchema } from "./constants/create-account-zod-schema";

// stores
export { useCreateAccountStore } from "./stores/create-account-store";

// hooks
export { useDefineVerifyEmailForm } from "./hooks/useDefineVerifyEmailForm";
export { useCreateAccountMutation } from "./hooks/useCreateAccountMutation";
export { useResendCodeMutation } from "./hooks/useResendCodeMutation";
export { useDefineCreateAccountForm } from "./hooks/useDefineCreateAccountForm";
export { useCreateCodeMutation } from "./hooks/useCreateCodeMutation";
export { useIsEmailAvailable } from "./hooks/useIsEmailAvailable";

// components
export { TermsAndConditionsLabel } from "./components/create-account/TermsAndConditionsLabel";
export { CreateAccountForm } from "./components/create-account/CreateAccountForm";
export { GoToLogin } from "./components/create-account/GoToLogin";
export { CreateAccount } from "./components/create-account/CreateAccount";

export { BackToCreateAccount } from "./components/verify-email/BackToCreateAccount";
export { VerifyEmailForm } from "./components/verify-email/VerifyEmailForm";
export { VerifyEmail } from "./components/verify-email/VerifyEmail";
export { ResendVerifyEmailCode } from "./components/verify-email/ResendVerifyEmailCode";

export { CreateAccountMain } from "./components/CreateAccountMain";

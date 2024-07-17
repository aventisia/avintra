import * as z from "zod";
import {
  maxLenError,
  minLenError,
  nameError,
  reqError,
  nameRegex,
  pwdRegex,
  pwdError,
  numericRegex,
  numericError,
} from "@/react-toolkit/components/form";

const createAccountFS = z
  .object({
    firstName: z
      .string()
      .min(1, { message: reqError("First name") })
      .max(255, { message: maxLenError("First name", 255) })
      .regex(nameRegex, {
        message: nameError("First name"),
      }),
    lastName: z
      .string()
      .min(1, { message: reqError("Last name") })
      .max(255, { message: maxLenError("Last name", 255) })
      .regex(nameRegex, {
        message: nameError("Last name"),
      }),
    email: z
      .string()
      .min(1, { message: reqError("Email") })
      .email(),
    pwd: z
      .string()
      .min(1, { message: reqError("Password") })
      .min(8, { message: minLenError("Password", 8) })
      .max(16, { message: maxLenError("Password", 16) })
      .regex(pwdRegex, { message: pwdError("Password") }),
    confirmPwd: z.string().min(1, { message: reqError("Confirm password") }),
    termsAgreement: z.boolean(),
  })
  .refine((data) => data.pwd === data.confirmPwd, {
    path: ["confirmPwd"],
    message: "Passwords do not match",
  });

const verifyEmailAddressFS = z.object({
  verificationCode: z
    .string()
    .min(1, { message: reqError("Verification code") })
    .min(6, { message: minLenError("Verification code", 6) })
    .max(6, { message: maxLenError("Verification code", 6) })
    .regex(numericRegex, {
      message: numericError("Verification code"),
    }),
});

export { createAccountFS, verifyEmailAddressFS };

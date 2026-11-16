import { maxLenError, minLenError, nameError, pwdError, reqError } from "@avplatform/ui/utils";
import { nameRegex, pwdRegex } from "@avplatform/ui/utils";
import * as z from "zod";

export const emailSchema = z
  .string()
  .min(1, { message: reqError("Email") })
  .email();

export const createAccountZodSchema = z
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
    email: emailSchema,
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
    message: "Passwords don't match. Type the same password in both fields.",
  })
  .refine((data) => data.termsAgreement, {
    path: ["termsAgreement"],
    message: "Accept the Terms of Service to continue.",
  });

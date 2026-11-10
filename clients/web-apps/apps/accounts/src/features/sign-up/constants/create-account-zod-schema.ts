import { maxLenError, minLenError, pwdError, reqError } from "@avplatform/ui/utils";
import { pwdRegex } from "@avplatform/ui/utils";
import * as z from "zod";

export const emailSchema = z
  .string()
  .min(1, { message: reqError("Email") })
  .email();

export const createAccountZodSchema = z
  .object({
    email: emailSchema,
    pwd: z
      .string()
      .min(1, { message: reqError("Password") })
      .min(8, { message: minLenError("Password", 8) })
      .max(16, { message: maxLenError("Password", 16) })
      .regex(pwdRegex, { message: pwdError("Password") }),
    termsAgreement: z.boolean(),
  })
  .refine((data) => data.termsAgreement, {
    path: ["termsAgreement"],
    message: "Accept the Terms of Service to continue.",
  });

import {
  maxLenError,
  minLenError,
  nameError,
  pwdError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { nameRegex, pwdRegex } from "@/react-toolkit/utils/regex-list";

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
    termsAgreement: z.boolean(),
  })
  .refine((data) => data.termsAgreement, {
    path: ["termsAgreement"],
    message: "You must accept our Terms of Service",
  });

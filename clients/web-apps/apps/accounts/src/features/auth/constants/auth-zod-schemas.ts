import { numericError, numericRegex, reqError } from "@avplatform/ui/utils";
import * as z from "zod";

import { PWD_RULES } from "./pwd-rules";

const emailSchema = z
  .string()
  .trim()
  .min(1, { message: reqError("Email") })
  .email({ message: "Enter a valid email address" });

const newPwdSchema = z
  .string()
  .min(1, { message: reqError("Password") })
  .refine((pwd) => PWD_RULES.every((rule) => rule.test(pwd)), {
    message: "Meet every password rule to continue",
  });

const emailFormSchema = z.object({ email: emailSchema });

const pwdFormSchema = z.object({ pwd: z.string().min(1, { message: reqError("Password") }) });

const createPwdFormSchema = z.object({ pwd: newPwdSchema });

const newPwdFormSchema = z.object({ newPwd: newPwdSchema, logoffFromAllSessions: z.boolean() });

const codeFormSchema = z.object({
  code: z
    .string()
    .min(1, { message: reqError("Code") })
    .length(6, { message: "Enter all 6 digits" })
    .regex(numericRegex, { message: numericError("Code") }),
});

export { codeFormSchema, createPwdFormSchema, emailFormSchema, newPwdFormSchema, pwdFormSchema };

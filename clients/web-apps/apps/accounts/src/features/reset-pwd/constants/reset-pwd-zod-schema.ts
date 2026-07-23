import { maxLenError, minLenError, pwdError, reqError } from "@avplatform/ui/utils";
import { pwdRegex } from "@avplatform/ui/utils";
import * as z from "zod";

export const resetPwdZodSchema = z
  .object({
    newPwd: z
      .string()
      .min(1, { message: reqError("Password") })
      .min(8, { message: minLenError("Password", 8) })
      .max(16, { message: maxLenError("Password", 16) })
      .regex(pwdRegex, { message: pwdError("Password") }),
    confirmNewPwd: z.string().min(1, { message: reqError("Confirm password") }),
    logoffFromAllSessions: z.boolean().default(false),
  })
  .refine((data) => data.newPwd === data.confirmNewPwd, {
    path: ["confirmNewPwd"],
    message: "Passwords do not match",
  });

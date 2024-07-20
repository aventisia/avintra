import * as z from "zod";
import {
  maxLenError,
  minLenError,
  reqError,
  pwdRegex,
  pwdError,
} from "@/react-toolkit/components/form";

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

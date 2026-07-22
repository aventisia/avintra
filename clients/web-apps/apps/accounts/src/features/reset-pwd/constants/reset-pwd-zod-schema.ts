import * as z from "zod";

import {
  maxLenError,
  minLenError,
  pwdError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { pwdRegex } from "@/react-toolkit/utils/regex-list";

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

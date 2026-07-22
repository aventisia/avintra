import * as z from "zod";

import {
  maxLenError,
  minLenError,
  numericError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { numericRegex } from "@/react-toolkit/utils/regex-list";

export const verifyCodeZodSchema = z.object({
  verificationCode: z
    .string()
    .min(1, { message: reqError("Verification code") })
    .min(6, { message: minLenError("Verification code", 6) })
    .max(6, { message: maxLenError("Verification code", 6) })
    .regex(numericRegex, {
      message: numericError("Verification code"),
    }),
});

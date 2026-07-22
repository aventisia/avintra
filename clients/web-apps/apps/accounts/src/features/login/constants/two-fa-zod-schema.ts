import {
  maxLenError,
  minLenError,
  numericError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { numericRegex } from "@/react-toolkit/utils/regex-list";

import * as z from "zod";

export const twoFAZodSchema = z.object({
  verificationCode: z
    .string()
    .min(1, { message: reqError("2FA code") })
    .min(6, { message: minLenError("2FA code", 6) })
    .max(6, { message: maxLenError("2FA code", 6) })
    .regex(numericRegex, {
      message: numericError("2FA code"),
    }),
});

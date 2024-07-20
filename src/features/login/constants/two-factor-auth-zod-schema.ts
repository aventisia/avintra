import * as z from "zod";
import {
  maxLenError,
  minLenError,
  reqError,
  numericRegex,
  numericError,
} from "@/react-toolkit/components/form";

export const twoFactorAuthZodSchema = z.object({
  verificationCode: z
    .string()
    .min(1, { message: reqError("2FA code") })
    .min(6, { message: minLenError("2FA code", 6) })
    .max(6, { message: maxLenError("2FA code", 6) })
    .regex(numericRegex, {
      message: numericError("2FA code"),
    }),
});
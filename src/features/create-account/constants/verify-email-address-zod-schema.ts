import * as z from "zod";
import {
  maxLenError,
  minLenError,
  reqError,
  numericRegex,
  numericError,
} from "@/react-toolkit/components/form";

export const verifyEmailAddressZodSchema = z.object({
  verificationCode: z
    .string()
    .min(1, { message: reqError("Verification code") })
    .min(6, { message: minLenError("Verification code", 6) })
    .max(6, { message: maxLenError("Verification code", 6) })
    .regex(numericRegex, {
      message: numericError("Verification code"),
    }),
});

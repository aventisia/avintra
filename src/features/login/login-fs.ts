import * as z from "zod";
import {
  maxLenError,
  minLenError,
  reqError,
  numericRegex,
  numericError,
} from "@/react-toolkit/components/form";

const tenantInfoFS = z.object({
  email: z
    .string()
    .min(1, { message: reqError("Email") })
    .email(),
});

const pwdLoginFS = z.object({
  email: z
    .string()
    .min(1, { message: reqError("Email") })
    .email(),
  pwd: z.string().min(1, { message: reqError("Password") }),
});

const twoFactorAuthFS = z.object({
  verificationCode: z
    .string()
    .min(1, { message: reqError("2FA code") })
    .min(6, { message: minLenError("2FA code", 6) })
    .max(6, { message: maxLenError("2FA code", 6) })
    .regex(numericRegex, {
      message: numericError("2FA code"),
    }),
});

export { tenantInfoFS, pwdLoginFS, twoFactorAuthFS };

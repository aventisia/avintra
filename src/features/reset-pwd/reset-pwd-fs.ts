import * as z from "zod";
import {
  maxLenError,
  minLenError,
  reqError,
  numericRegex,
  numericError,
  pwdRegex,
  pwdError,
} from "@/react-toolkit/components/form";

const provideEmailToResetPwdFS = z.object({
  email: z
    .string()
    .min(1, { message: reqError("Email") })
    .email(),
});

const verifyCodeFS = z.object({
  verificationCode: z
    .string()
    .min(1, { message: reqError("Verification code") })
    .min(6, { message: minLenError("Verification code", 6) })
    .max(6, { message: maxLenError("Verification code", 6) })
    .regex(numericRegex, {
      message: numericError("Verification code"),
    }),
});

const resetPwdFS = z
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

export { provideEmailToResetPwdFS, verifyCodeFS, resetPwdFS };

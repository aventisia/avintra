import { reqError } from "@avplatform/ui/utils";
import { z } from "zod";

export const PwdZodSchema = z
  .object({
    oldPwd: z
      .string({ required_error: "Please enter your current password." })
      .min(8, { message: reqError("Old Password") }),
    newPwd: z
      .string()
      .min(8, { message: "Password must be greater than 8 characters" })
      .max(16, { message: "Password must be less than 16 characters" }),
    confirmNewPwd: z
      .string()
      .min(8, { message: "Password must be greater than 8 characters" })
      .max(16, { message: "Password must be less than 16 characters" }),
    logoffFromOtherSessions: z.boolean().default(false),
  })
  .superRefine(({ newPwd, confirmNewPwd }, ctx) => {
    if (newPwd !== confirmNewPwd) {
      ctx.addIssue({
        code: "custom",
        message: "The passwords did not match",
        path: ["confirmNewPwd"],
      });
    }
  });

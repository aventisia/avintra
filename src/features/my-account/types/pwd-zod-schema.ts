import { z } from "zod";

export const PwdZodSchema = z
  .object({
    oldPwd: z.string({ required_error: "Please enter your current password." }),
    newPwd: z
      .string({ required_error: "Password must be greater than 8 charectors" })
      .min(8)
      .max(16),
    confirmNewPwd: z
      .string({ required_error: "Password must be greater than 8 charectors" })
      .min(8)
      .max(16),
    logoffFromOtherSessions: z.boolean({
      required_error: "please select weather log out all sessions elsewhere.",
    }),
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

import { reqError } from "@avplatform/ui/utils";
import { z } from "zod";

const newPasswordFields = {
  newPwd: z
    .string()
    .min(8, { message: "Password must be greater than 8 characters" })
    .max(16, { message: "Password must be less than 16 characters" }),
  confirmNewPwd: z
    .string()
    .min(8, { message: "Password must be greater than 8 characters" })
    .max(16, { message: "Password must be less than 16 characters" }),
  logoffFromOtherSessions: z.boolean().default(false),
};

const passwordsMatch = (
  { newPwd, confirmNewPwd }: { newPwd: string; confirmNewPwd: string },
  ctx: z.RefinementCtx,
) => {
  if (newPwd !== confirmNewPwd) {
    ctx.addIssue({
      code: "custom",
      message: "The passwords did not match",
      path: ["confirmNewPwd"],
    });
  }
};

export const PwdZodSchema = z
  .object({
    oldPwd: z
      .string({ required_error: "Please enter your current password." })
      .min(8, { message: reqError("Old Password") }),
    ...newPasswordFields,
  })
  .superRefine(passwordsMatch);

export const PwdSetZodSchema = z.object(newPasswordFields).superRefine(passwordsMatch);

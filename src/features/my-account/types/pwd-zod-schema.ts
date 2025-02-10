import { z } from "zod";

export const PwdZodSchema = z.object({
    oldPwd: z.string().max(200),
    newPwd: z.string({ required_error: "Password must be greater than 8 charectors" }).min(8).max(16),
    cofirmNewPwd: z.string().min(8).max(16),
    logoffFromOtherSessions: z.boolean({
        required_error: ""
    })
}).superRefine(({ newPwd, cofirmNewPwd }, ctx) => {
    if (newPwd !== cofirmNewPwd) {
        ctx.addIssue({
            code: "custom",
            message: "The passwords did not match",
            path: ['cofirmNewPwd']
        });
    }
});
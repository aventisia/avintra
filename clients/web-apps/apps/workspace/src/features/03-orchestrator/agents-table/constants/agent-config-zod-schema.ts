import { z } from "zod";

export const agentConfigZodSchema = z.object({
  maxExecutionTimeInMinutes: z.coerce
    .number({
      invalid_type_error: "Must be a number",
    })
    .min(1, { message: "Minimum time must be 1 " }),
});

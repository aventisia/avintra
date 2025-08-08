import * as z from "zod";


export const summarizationModelTestFormZodSchema = z
  .object({
    summary: z.string().default(""),
})

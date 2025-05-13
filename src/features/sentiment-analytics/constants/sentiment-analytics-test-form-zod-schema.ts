import * as z from "zod";

const categoriesSchema = z.object({
    fieldName: z.string().optional(),
    accuracy: z.number().optional(),
})

export const sentimentalAnalyticsTestFormZodSchema = z
  .object({
    categories: z.array(categoriesSchema),
})

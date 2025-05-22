import * as z from "zod";

const categoriesSchema = z.object({
    name: z.string().optional(),
    checked: z.boolean().optional(),
})

export const classificationModelTestFormZodSchema = z
  .object({
    categories: z.array(categoriesSchema),
    submitForFineTuning: z.boolean()
})

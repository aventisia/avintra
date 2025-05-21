import * as z from "zod";

const categoriesSchema = z.object({
    name: z.string().optional(),
    // Ensuring 'accuracy' is always a number, even if it comes as a string
    accuracy: z
      .union([z.string(), z.number()]) // Allow both string and number inputs
      .transform((value) => (typeof value === "string" ? parseFloat(value) : value)) // Transform the string to a number
      .refine((value) => !isNaN(value), { message: "Accuracy must be a valid number" }) // Ensures the value is a valid number
      .refine((value) => value >= 0 && value <= 100, { message: "Accuracy must be between 0 and 100" }) // Enforces the min and max range

})

export const classificationModelTestFormZodSchema = z
  .object({
    categories: z.array(categoriesSchema),
})

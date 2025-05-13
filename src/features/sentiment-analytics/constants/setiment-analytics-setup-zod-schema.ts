import * as z from "zod";
import { reqError } from "@aventisia/ui/utils";

export const categoriesSchema = z.object({
    categoryName: z.string().min(1, {message: reqError("Category Name")}),
    instructions: z.string().optional()
})

export const sentimentAnalyticsSetupFormZodSchema = z
  .object({
    context: z.string().optional(),
    categories: z.array(categoriesSchema),
    nodePrompt: z.string().min(1, {message: reqError("Node Prompt")}),
})

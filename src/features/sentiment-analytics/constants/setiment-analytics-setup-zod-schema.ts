import * as z from "zod";
import { reqError } from "@aventisia/ui/utils";

export const categoriesSchema = z.object({
    name: z.string().min(1, {message: reqError("Category Name")}),
    instructions: z.string().optional()
})

export const sentimentAnalyticsSetupFormZodSchema = z
  .object({
    context: z.string().min(1, {message: reqError("Context")}),
    categories: z.array(categoriesSchema),
    prompt: z.string().min(1, {message: reqError("Prompt")}),
    llm: z.string().min(1, {message: reqError("Model Type")}),
    temperature: z.number().default(0),
})

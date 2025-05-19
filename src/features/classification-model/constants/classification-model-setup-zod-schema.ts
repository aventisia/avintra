import * as z from "zod";
import { reqError } from "@aventisia/ui/utils";

export const categoriesSchema = z.object({
    name: z.string().min(1, {message: reqError("Category Name")}),
    instructions: z.string().optional()
})

export const classificationModelSetupFormZodSchema = z
  .object({
    context: z.string().min(1, {message: reqError("Context")}),
    categories: z.array(categoriesSchema),
    allowMultipleClasses: z.boolean(),
    uncertaintyAction: z.string().min(1, {message: reqError("When No Clear Match")}),
    prompt: z.string().min(1, {message: reqError("Prompt")}),
})

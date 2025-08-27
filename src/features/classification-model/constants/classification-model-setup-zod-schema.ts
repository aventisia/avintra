import { llmConfigZodSchema } from "@/features/llm-configuration/constants/llm-config-zod-schema";

import { reqError } from "@aventisia/ui/utils";
import * as z from "zod";

const subSubCategorySchema = z.object({
  name: z.string().min(1, { message: reqError("Sub-Category") }),
  instructions: z.string().optional(),
});

const subCategorySchema = z.object({
  name: z.string().min(1, { message: reqError("Sub-Category") }),
  instructions: z.string().optional(),
  subSubCategories: z.array(subSubCategorySchema).optional().default([]),
});

export const categoriesSchema = z.object({
  name: z.string().min(1, { message: reqError("Category Name") }),
  instructions: z.string().optional(),
  subCategories: z.array(subCategorySchema).optional().default([]),
});

export const classificationModelSetupFormZodSchema = llmConfigZodSchema.extend({
  id: z.string().readonly(),
  name: z.string().readonly().default("Classification"),
  setupObject: z.object({
    allowMultipleClasses: z.boolean(),
    categories: z.array(categoriesSchema),
  }),
});

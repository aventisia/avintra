import * as z from "zod";
import { reqError } from "@aventisia/ui/utils";
import { llmConfigZodSchema } from "@/features/llm-configuration/constants/llm-config-zod-schema";

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
    name: z.string().min(1, {message: reqError("Category Name")}),
    instructions: z.string().optional(),
      subCategories: z.array(subCategorySchema).optional().default([]),
})

export const sentimentAnalyticsSetupFormZodSchema = llmConfigZodSchema.extend({
    id: z.string().readonly(),
    name: z.string().readonly().default("SentimentAnalytics"),
    setupObject: z.object({
      categories: z.array(categoriesSchema)
    }),
})


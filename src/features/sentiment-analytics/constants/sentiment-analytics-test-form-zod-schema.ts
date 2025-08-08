import * as z from "zod";

const subSubCategorySchema = z.object({
  name: z.string(),
  value: z.string().default("false"),
  confidenceScore: z.string().default(""),
});

const subCategorySchema = z.object({
  name: z.string(),
  value: z.string().default("false"),
  confidenceScore: z.string().default(""),
  subSubCategories: z.array(subSubCategorySchema).default([]).nullable(),
});


export const sentimentalAnalyticsTestFormZodSchema = z
  .array(z.object({
    name: z.string(),
    value: z.string().default("false"),
    confidenceScore: z.string().default(""),
    subCategories: z.array(subCategorySchema).default([]).nullable()
}))

import * as z from "zod";

const subSubCategorySchema = z.object({
  name: z.string(),
  value: z.string().default("false"),
});

const subCategorySchema = z.object({
  name: z.string(),
  value: z.string().default("false"),
  subSubCategories: z.array(subSubCategorySchema).default([]).nullable(),
});

const categoriesSchema = z.object({
    name: z.string(),
    value: z.string().default("false"),
    subCategories: z.array(subCategorySchema).default([]).nullable()
})

export const sentimentalAnalyticsTestFormZodSchema = z
  .object({
    categories: z.array(categoriesSchema)
})

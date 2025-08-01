import * as z from "zod";

const subSubCategorySchema = z.object({
  name: z.string(),
  value: z.string(),
});

const subCategorySchema = z.object({
  name: z.string(),
  value: z.string(),
  subSubCategories: z.array(subSubCategorySchema).default([]).nullable(),
});

const categoriesSchema = z.object({
    name: z.string(),
    value: z.string(),
    subCategories: z.array(subCategorySchema).default([]).nullable()
})

export const sentimentalAnalyticsTestFormZodSchema = z
  .object({
    categories: z.array(categoriesSchema)
})

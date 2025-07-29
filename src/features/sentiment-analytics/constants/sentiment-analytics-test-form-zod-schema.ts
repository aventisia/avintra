import * as z from "zod";

const subSubCategorySchema = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
});

const subCategorySchema = z.object({
  name: z.string().optional(),
  value: z.string().optional(),
  subSubCategories: z.array(subSubCategorySchema).optional().default([]),
});

const categoriesSchema = z.object({
    name: z.string().optional(),
    value: z.string().optional(),
    subCategories: z.array(subCategorySchema).optional().default([]),
    
})

export const sentimentalAnalyticsTestFormZodSchema = z
  .object({
    categories: z.array(categoriesSchema),
})

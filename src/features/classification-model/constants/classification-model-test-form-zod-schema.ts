import * as z from "zod";

const subSubCategorySchema = z.object({
  name: z.string(),
  value: z.boolean().default(false),
});

const subCategorySchema = z.object({
  name: z.string(),
  value: z.boolean().default(false),
  subSubCategories: z.array(subSubCategorySchema).default([]).nullable(),
});

const categoriesSchema = z.object({
    name: z.string(),
    value: z.boolean().default(false),
    subCategories: z.array(subCategorySchema).default([]).nullable()
})

export const classificationModelTestFormZodSchema = z
  .object({
    categories: z.array(categoriesSchema),
})

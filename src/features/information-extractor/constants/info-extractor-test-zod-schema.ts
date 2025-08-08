import * as z from "zod";

const fieldsSchema = z.object({
    name: z.string(),
    value: z.string().default(""),
    confidenceScore: z.string().default("0"),
})

const tableSchema = z.object({
    name: z.string().readonly(),
    headers: z.array(
      z.object({
        name: z.string(),
        values: z.array(z.string())
      })
    )
})

export const infoExtractorTestFormZodSchema = z
  .object({
    fields: z.array(fieldsSchema),
    tables: z.array(tableSchema).nullable(),
})

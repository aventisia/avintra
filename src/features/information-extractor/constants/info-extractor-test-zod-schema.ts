import * as z from "zod";

const fieldsSchema = z.object({
    name: z.string().optional(),
    value: z.string().optional(),
    accuracy: z.number().optional(),
})

const tableSchema = z.object({
    name: z.string(),
    extractedData: z.array(
      z.object({
        name: z.string(),
        values: z.array(z.string().optional())
      })
    )
})


export const infoExtractorTestFormZodSchema = z
  .object({
    fields: z.array(fieldsSchema),
    tables: z.array(tableSchema).optional().nullable(),
    submitForFineTuning: z.boolean()
})

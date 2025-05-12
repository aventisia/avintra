import * as z from "zod";

const fieldsSchema = z.object({
    fieldName: z.string().optional(),
    fieldValue: z.string().optional(),
    accuracy: z.number().optional(),
})

const tableSchema = z.object({
    tableName: z.string(),
    extractedData: z.array(
      z.object({
        headerName: z.string(),
        values: z.array(z.string().optional())
      })
    )
})


export const infoExtractorTestFormZodSchema = z
  .object({
    fields: z.array(fieldsSchema),
    tables: z.array(tableSchema).optional().nullable(),
})

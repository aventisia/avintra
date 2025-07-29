import * as z from "zod";
import { reqError } from "@aventisia/ui/utils";
import { llmConfigZodSchema } from "@/features/llm-configuration/constants/llm-config-zod-schema";

export const dataToBeExtractedSchema = z.object({
    name: z.string().min(1, {message: reqError("Field Name")}),
    type: z.string().min(1, {message: reqError("Type")}),
    instructions: z.string().optional()
})

const tableSchema = z.object({
    context: z.string().optional(),
    name: z.string().optional(),
    tableHeaders: z.array(
      z.object({
        name: z.string().min(1, {message: reqError("Header")}),
        type: z.string().min(1, {message: reqError("Type")}),
        instructions: z.string().optional()
      })
    )
})

export const addInfoExtractorFormZodSchema = llmConfigZodSchema.extend({
    id: z.string().readonly(),
    name: z.string().readonly().default("Extraction"),
    setupObject: z.object({
      tables: z.array(tableSchema).optional().nullable(),
      fields: z.array(dataToBeExtractedSchema)
    }),
})

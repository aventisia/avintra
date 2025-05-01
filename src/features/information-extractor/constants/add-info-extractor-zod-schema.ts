import * as z from "zod";
import {
  reqError,
} from "@/react-toolkit/utils/error-message-list";

export const dataToBeExtractedSchema = z.object({
    fieldName: z.string().min(1, {message: reqError("Field Name")}),
    type: z.string().min(1, {message: reqError("Type")}),
    instructions: z.string().optional()
})

const tableSchema = z.object({
    tableContext: z.string().optional(),
    tableName: z.string().optional(),
    tableData: z.array(
      z.object({
        headerName: z.string().min(1, {message: reqError("Header")}),
        type: z.string().min(1, {message: reqError("Type")}),
        instructions: z.string().optional()
      })
    )
})

export const addInfoExtractorFormZodSchema = z
  .object({
    documentContext: z.string().optional(),
    fields: z.array(dataToBeExtractedSchema),
    tables: z.array(tableSchema).optional().nullable(),
    nodePrompt: z.string().min(1, {message: reqError("Node Prompt")}),
})

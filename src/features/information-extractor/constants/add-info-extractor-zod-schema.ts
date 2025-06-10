import * as z from "zod";
import { reqError } from "@aventisia/ui/utils";

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

export const addInfoExtractorFormZodSchema = z
  .object({
    context: z.string().min(1, {message: reqError("Context")}),
    prompt: z.string().min(1, {message: reqError("Prompt")}),
    tableMetadata: z.array(tableSchema).optional().nullable(),
    fieldSetups: z.array(dataToBeExtractedSchema),
    llm: z.string().min(1, {message: reqError("Model Type")}),
    temperature: z.number().default(0),
})

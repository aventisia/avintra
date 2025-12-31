import * as z from "zod";
import { reqError } from "@aventisia/ui/utils";

export const dataToBeExtractedSchema = z.object({
  fieldName: z.string().min(1, { message: reqError("Field Name") }),
  type: z.string().min(1, { message: reqError("Type") }),
  instructions: z.string().optional(),
});

const tableSchema = z.object({
  tableContext: z.string().optional(),
  tableName: z.string().optional(),
  tableData: z.array(
    z.object({
      headerName: z.string().min(1, { message: reqError("Header Name") }),
      type: z.string().min(1, { message: reqError("Type") }),
      instructions: z.string().optional(),
    }),
  ),
});

export const addInfoExtractorFormZodSchema = z.object({
  context: z.string().optional(),
  inputText: z.string().min(1, { message: reqError("Input Text") }),
  fields: z.array(dataToBeExtractedSchema),
  tables: z.array(tableSchema).optional().nullable(),
  nodePrompt: z.string().min(1, { message: reqError("Node Prompt") }),
  saveInModelLibrary: z.boolean().optional(),
  modelName: z.string().optional(),
  selectedModel: z.string().optional().nullable(),
});

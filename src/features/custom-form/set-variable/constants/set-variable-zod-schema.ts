import { reqError } from "@/react-toolkit/utils/error-message-list";
import { z } from "zod";
import { variableRegex } from "@/features/dynamic-form";

export const setVariableZodSchema = z
  .object({
    variable: z.string().min(1, {message: reqError("Variable name")}).regex(variableRegex, { message: "Invalid variable name format." }),
    value: z.string().min(1, {message: reqError("Value")}),
})

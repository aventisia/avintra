import { alphaNumericError, maxLenError, reqError } from "@aventisia/ui/utils";
import { alphaNumericRegex } from "@aventisia/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a model name.
 */
export const modelNameSchema = z
  .string()
  .min(1, { message: reqError("Model name") })
  .max(255, { message: maxLenError("Model name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Model name"),
  });

/**
 * Represents the Zod schema for a model.
 */
export const modelZodSchema = z.object({
  id: z.string(),
  type: z.string().min(1, { message: reqError("Model type") }),
  name: modelNameSchema,
  llm: z.string(),
  description: z
    .string()
    .max(500, { message: maxLenError("Model description", 500) }),
  // Read (view) only fields
  status: z.string(),
  createdBy: z.string(),
  createdOn: z.date(),
  trainedOn: z.date(),
});

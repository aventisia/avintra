import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a model name.
 */
export const dataFieldNameSchema = z
  .string()
  .min(1, { message: reqError("Model name") })
  .max(255, { message: maxLenError("Model name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Model name"),
  });

/**
 * Represents the Zod schema for a model.
 */
export const dataFieldSchema = z.object({
  id: z.string(),
  type: z.string().min(1, { message: reqError("Data type") }),
  name: dataFieldNameSchema,
  color: z.string(),
  description: z
    .string()
    .max(500, { message: maxLenError("Model description", 500) }),
  mlModelId: z.string(),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
});

import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";

import { z } from "zod";

/**
 * Represents the Zod object's item schema for a execution name.
 */
export const executionNameSchema = z
  .string()
  .min(1, { message: reqError("Execution name") })
  .max(255, { message: maxLenError("Execution name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Execution name"),
  });

/**
 * Represents the Zod schema for a execution.
 */
export const executionZodSchema = z.object({
  id: z.string(),
  name: z.string(),
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

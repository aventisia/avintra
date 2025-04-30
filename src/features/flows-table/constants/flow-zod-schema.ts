import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";

import { z } from "zod";

/**
 * Represents the Zod object's item schema for a flow name.
 */
export const flowNameSchema = z
  .string()
  .min(1, { message: reqError("Flow name") })
  .max(255, { message: maxLenError("Flow name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Flow name"),
  });

/**
 * Represents the Zod schema for a flow.
 */
export const flowZodSchema = z.object({
  id: z.string(),
  type: z.string().min(1, { message: reqError("Flow type") }),
  name: flowNameSchema,
  description: z
    .string()
    .max(500, { message: maxLenError("Flow description", 500) }),
  thumbnail: z.string(),
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  flowCommentCount: z.number().default(0),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

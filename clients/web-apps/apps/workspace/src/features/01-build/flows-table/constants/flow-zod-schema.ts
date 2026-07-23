import { flexibleNameError, flexibleNameRegex, maxLenError, reqError } from "@avplatform/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a flow name.
 */
export const flowNameSchema = z
  .string()
  .min(1, { message: reqError("Agent name") })
  .max(255, { message: maxLenError("Agent name", 255) })
  .regex(flexibleNameRegex, {
    message: flexibleNameError("Agent name"),
  });

/**
 * Represents the Zod schema for a flow.
 */
export const flowZodSchema = z.object({
  id: z.string(),
  type: z.string().min(1, { message: reqError("Agent type") }),
  name: flowNameSchema,
  description: z.string().max(500, { message: maxLenError("Agent description", 500) }),
  thumbnail: z.string(),
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  flowCommentCount: z.number().default(0),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

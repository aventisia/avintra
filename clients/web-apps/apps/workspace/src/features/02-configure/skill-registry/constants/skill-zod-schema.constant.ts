import { maxLenError, reqError, skillNameError, skillNameRegex } from "@avplatform/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a skill name.
 */
export const skillNameSchema = z
  .string()
  .min(1, { message: reqError("Name") })
  .max(255, { message: maxLenError("Name", 255) })
  .regex(skillNameRegex, {
    message: skillNameError("Name"),
  });

/**
 * Represents the Zod schema for a skill entry.
 */
export const skillZodSchema = z.object({
  id: z.string(),
  name: skillNameSchema,
  description: z.string().optional(),
  isDisabled: z.boolean().default(false).optional(),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

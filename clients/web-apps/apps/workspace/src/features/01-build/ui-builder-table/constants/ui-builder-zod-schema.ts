import { flexibleNameError, flexibleNameRegex, maxLenError, reqError } from "@avplatform/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a custom UI builder project name.
 */
export const uiBuilderNameSchema = z
  .string()
  .min(1, { message: reqError("Project name") })
  .max(255, { message: maxLenError("Project name", 255) })
  .regex(flexibleNameRegex, {
    message: flexibleNameError("Project name"),
  });

/**
 * Represents the Zod schema for a custom UI builder project.
 */
export const uiBuilderZodSchema = z.object({
  id: z.string(),
  name: uiBuilderNameSchema,
  description: z.string().max(500, { message: maxLenError("Project description", 500) }),
  isTenantWideAccess: z.boolean().default(false),
  isDisabled: z.boolean().default(false),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

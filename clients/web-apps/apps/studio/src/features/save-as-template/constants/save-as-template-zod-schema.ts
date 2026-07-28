import { reqError } from "@avplatform/ui/utils";
import { z } from "zod";

export const fileSchema = z.object({
  name: z.string(),
  extension: z.string(),
  size: z.number(),
  path: z.string(),
});

/**
 * saveAsTemplateSchema
 *
 * Zod schema for validating the "Save As Template" form.
 * Enforces required fields and conditional logic for access levels.
 */
export const saveAsTemplateSchema = z
  .object({
    // Template name (required, non-empty string)
    name: z.string().min(1, "Template Name is required"),

    // Optional template description
    description: z.string().optional(),

    // Optional template description
    instruction: z.string().optional(),

    // Access level for the template (e.g., Tenant, Public, Spaces)
    accessType: z.string().min(1, "AccessLevel is required"),

    // Optional list of tags for filtering or categorization
    tags: z.array(z.string()).optional(),

    // Optional list of space IDs (conditionally required)
    spaces: z.array(z.string()).optional(),

    resources: z.array(fileSchema),
  })
  .superRefine((data, ctx) => {
    // Custom validation: If access level is "Spaces", ensure at least one space is selected
    if (
      data.accessType === "Spaces" &&
      (!data.spaces || data.spaces.length === 0)
    ) {
      ctx.addIssue({
        path: ["spaces"],
        code: z.ZodIssueCode.custom,
        message: reqError("Spaces"),
      });
    }
  });

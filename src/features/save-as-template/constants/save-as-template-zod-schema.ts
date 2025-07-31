import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

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

    // Target type to save as (e.g., Agent or Block)
    saveAs: z.string().min(1, "Save as is required"),

    // Access level for the template (e.g., Tenant, Public, Spaces)
    accessLevel: z.string().min(1, "AccessLevel is required"),

    // Flag to indicate whether this is being saved as a template
    saveAsTemplate: z.boolean().default(true),

    // Optional list of tags for filtering or categorization
    tags: z.array(z.string()).optional(),

    // Optional list of space IDs (conditionally required)
    spaces: z.array(z.string()).optional(),
  })
  .superRefine((data, ctx) => {
    // Custom validation: If access level is "Spaces", ensure at least one space is selected
    if (
      data.accessLevel === "Spaces" &&
      (!data.spaces || data.spaces.length === 0)
    ) {
      ctx.addIssue({
        path: ["spaces"],
        code: z.ZodIssueCode.custom,
        message: reqError("Spaces"),
      });
    }
  });

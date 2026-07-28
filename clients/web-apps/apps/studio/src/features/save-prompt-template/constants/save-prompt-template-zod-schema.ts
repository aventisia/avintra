import { z } from "zod";

/**
 * savePromptTemplateSchema
 *
 * Zod schema for validating the "Save As Template" form.
 * Enforces required fields and conditional logic for access levels.
 */
export const savePromptTemplateSchema = z.object({
  // Template name (required, non-empty string)
  name: z.string().min(1, "Template Name is required"),

  // Optional template description
  description: z.string().optional(),

  // // Optional template description
  // systemInput: z.string().optional(),

  // Access level for the template (e.g., Tenant, Public, Self)
  accessType: z.string().min(1, "Access Level is required"),

  // Optional list of tags for filtering or categorization
  tags: z.array(z.string()).optional(),
});

import { flexibleNameError, flexibleNameRegex, maxLenError, reqError } from "@avplatform/ui/utils";
import { z } from "zod";

export const triggerNameSchema = z
  .string()
  .min(1, { message: reqError("Trigger Name") })
  .max(255, { message: maxLenError("Trigger Name", 255) })
  .regex(flexibleNameRegex, {
    message: flexibleNameError("Trigger name"),
  });

/**
 * Represents the Zod schema for a trigger.
 */
export const triggerZodSchema = z.object({
  // Unique identifier for the trigger
  id: z.string(),

  // Trigger name validation using the custom schema
  name: triggerNameSchema,

  agent: z.array(z.any()).min(1, { message: reqError("Agent") }),

  webhookUrl: z.string().optional(),

  expectedPayloadSchema: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (!value?.trim()) return true;
        try {
          const parsed = JSON.parse(value);
          return typeof parsed === "object" && parsed !== null && !Array.isArray(parsed);
        } catch {
          return false;
        }
      },
      { message: "Input arguments schema must be empty or a valid JSON object" },
    ),

  callbackUrl: z.string().optional(),

  // Flag to disable the trigger (optional)
  isDisabled: z.boolean().nullable().optional(),
});

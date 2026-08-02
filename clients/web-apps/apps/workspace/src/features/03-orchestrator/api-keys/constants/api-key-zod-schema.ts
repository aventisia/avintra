import { flexibleNameError, flexibleNameRegex, maxLenError, reqError } from "@avplatform/ui/utils";
import { z } from "zod";

/**
 * Zod schema for creating or updating an API key.
 */
export const apiKeyZodSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .trim()
    .min(1, { message: reqError("Name") })
    .max(255, { message: maxLenError("Name", 255) })
    .regex(flexibleNameRegex, { message: flexibleNameError("Name") }),
  expiresAt: z
    .date()
    .nullable()
    .refine((value) => !value || value > new Date(), "Expiration date must be in the future.")
    .or(z.literal(null)),
  permissions: z
    .object({
      machineAuth: z.boolean(),
      webhookTrigger: z.boolean(),
      createQueueWorkItem: z.boolean(),
      cloudExecution: z.boolean(),
    })
    .nullable(),
  keyPrefix: z.string().nullable().optional(),
  lastUsedAt: z.string().nullable().optional(),
  isRevoked: z.boolean(),
  createdBy: z.string().nullable().optional(),
  createdOn: z.string().nullable().optional(),
  lastModifiedBy: z.string().nullable().optional(),
  lastModifiedOn: z.string().nullable().optional(),
});

/**
 * Type alias inferred from the API key Zod schema (used for form values).
 */
export type ApiKeyFormValues = z.infer<typeof apiKeyZodSchema>;

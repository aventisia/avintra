import {
  flexibleNameError,
  flexibleNameRegex,
  maxLenError,
  // numericRegex,
  reqError,
} from "@avplatform/ui/utils";
import { z } from "zod";

// Shape of each item in the array
const itemSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  type: z.enum(["int", "string", "Date", "Array"]),
  isRequired: z.boolean().default(false).optional(),
  isUsedForUniqueIdentifier: z.boolean().default(false).optional(),
});

const jsonInputSchema = z.string().refine(
  (val) => {
    try {
      const parsed = JSON.parse(val);

      // Must be an array
      if (!Array.isArray(parsed)) return false;

      // Validate each item against itemSchema
      itemSchema.array().parse(parsed);

      return true;
    } catch {
      return false;
    }
  },
  {
    message: "Input must be a valid JSON array with correct object structure.",
  },
);

// Shape of each custom status in the array
const statusItemSchema = z.object({
  name: z.string().min(1),
  label: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  routeQueue: z.string().nullable().optional(),
});

const jsonStatusesSchema = z.string().refine(
  (val) => {
    try {
      const parsed = JSON.parse(val);

      // Must be an array
      if (!Array.isArray(parsed)) return false;

      // Validate each item against statusItemSchema
      statusItemSchema.array().parse(parsed);

      return true;
    } catch {
      return false;
    }
  },
  {
    message: "Input must be a valid JSON array with correct status structure.",
  },
);

/**
 * Represents the Zod object's item schema for a queue name.
 */
export const queueNameSchema = z
  .string()
  .min(1, { message: reqError("Queue name") })
  .max(255, { message: maxLenError("Queue name", 255) })
  .regex(flexibleNameRegex, {
    message: flexibleNameError("Queue name"),
  });

/**
 * Represents the Zod schema for a queue.
 */
export const queueZodSchema = z.object({
  crudAction: z.enum(["create", "read", "update"]).default("create"),
  id: z.string(),
  name: queueNameSchema,
  type: z.string().min(1, { message: reqError("Type") }),
  description: z.string().optional().nullable(),

  isUniqueReferencesEnforced: z.boolean().default(false),
  isStoredEncrypted: z.boolean().default(false),
  // shouldRetryFailedItems: z.boolean().default(false),
  // shouldRetryAbandonedItems: z.boolean().default(false),
  // maximumRetryAttempts: z
  //   .union([
  //     z.number({ required_error: reqError("Retry count") }),
  //     z
  //       .string()
  //       .min(1, { message: reqError("Retry count") })
  //       .refine(
  //         (check) => numericRegex.test(check),
  //         "Enter correct value for Retry count",
  //       )
  //       .transform((val) => parseInt(val)),
  //   ])
  //   .optional(),
  inputSchema: jsonInputSchema,
  statuses: jsonStatusesSchema,

  routeToQueues: z.array(z.string()).nullable().optional(),
  processingMode: z.string().default("Manual"),
  credentialName: z.string().nullable().optional(),
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
}).superRefine((data, ctx) => {
  // When the Instance Type is "User", at least one disposition status is required.
  if (data.type === "User") {
    let hasStatuses = false;

    try {
      const parsed = JSON.parse(data.statuses);
      hasStatuses = Array.isArray(parsed) && parsed.length > 0;
    } catch {
      hasStatuses = false;
    }

    if (!hasStatuses) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["statuses"],
        message: "Disposition Status is required when the Instance Type is User.",
      });
    }
  }
});

export const queueUploadFileZodSchema = z.object({
  payloadData: z.string(),

  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

export const queueAssignAgentsZodSchema = z.object({
  agentIds: z.array<z.ZodString>(z.string()),

  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

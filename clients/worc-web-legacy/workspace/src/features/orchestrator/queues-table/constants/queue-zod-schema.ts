import {
  alphaNumericError,
  alphaNumericRegex,
  maxLenError,
  // numericRegex,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

// Shape of each item in the array
const itemSchema = z.object({
  name: z.string(),
  description: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  type: z.enum(["int", "string", "Date"]),
  isRequired: z.boolean().default(false).optional(),
  isUsedForUniqueIdentifier: z.boolean().default(false).optional(),
});

// Validates a JSON string that parses into an array of valid items
const jsonInputSchema = z.string().refine(
  (val) => {
    try {
      const parsed = JSON.parse(val);
      itemSchema.array().parse(parsed); // throws if invalid
      return true;
    } catch {
      return false;
    }
  },
  {
    message: "Input must be a valid JSON array with correct object structure.",
  },
);

/**
 * Represents the Zod object's item schema for a queue name.
 */
export const queueNameSchema = z
  .string()
  .min(1, { message: reqError("Queue name") })
  .max(255, { message: maxLenError("Queue name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Queue name"),
  });

/**
 * Represents the Zod schema for a queue.
 */
export const queueZodSchema = z.object({
  crudAction: z.enum(["create", "read", "update"]).default("create"),
  id: z.string(),
  name: queueNameSchema,
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
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
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

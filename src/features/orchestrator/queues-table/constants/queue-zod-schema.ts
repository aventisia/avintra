import {
  alphaNumericError,
  alphaNumericRegex,
  maxLenError,
  numericRegex,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

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
export const queueZodSchema = z
  .object({
    crudAction: z.enum(["create", "read", "update"]).default("create"),
    id: z.string(),
    name: queueNameSchema,
    description: z.string().optional().nullable(),

    isUniqueReferencesEnforced: z.boolean().default(false),
    isStoredEncrypted: z.boolean().default(false),
    shouldRetryFailedItems: z.boolean().default(false),
    shouldRetryAbandonedItems: z.boolean().default(false),
    maximumRetryAttempts: z
      .union([
        z.number({ required_error: reqError("Retry count") }),
        z
          .string()
          .min(1, { message: reqError("Retry count") })
          .refine(
            (check) => numericRegex.test(check),
            "Enter correct value for Retry count",
          )
          .transform((val) => parseInt(val)),
      ])
      .optional(),

    specificDataSchemaFile: z
      .instanceof(File, { message: reqError("Specific data json schema") })
      .refine(
        (file) => {
          const allowedTypes = ["application/json"];
          return allowedTypes.includes(file.type);
        },
        { message: "Invalid file type. Only json files are allowed." },
      )
      .refine((file) => file.size <= 5 * 1024 * 1024, {
        message: "File size must be less than 5MB.",
      })
      .optional(),
    outputDataSchemaFile: z
      .instanceof(File, { message: reqError("Output data json schema") })
      .refine(
        (file) => {
          const allowedTypes = ["application/json"];
          return allowedTypes.includes(file.type);
        },
        { message: "Invalid file type. Only json files are allowed." },
      )
      .refine((file) => file.size <= 5 * 1024 * 1024, {
        message: "File size must be less than 5MB.",
      })
      .optional(),

    isDisabled: z.boolean().default(false),
    // Read (view) only fields
    createdBy: z.string(),
    createdOn: z.date(),
    lastModifiedBy: z.string(),
    lastModifiedOn: z.date(),
  })
  .refine(
    (check) => check.crudAction == "update" || check.specificDataSchemaFile,
    {
      path: ["specificDataSchemaFile"],
      message: reqError("Specific data json schema"),
    },
  )
  .refine(
    (check) => check.crudAction == "update" || check.outputDataSchemaFile,
    {
      path: ["outputDataSchemaFile"],
      message: reqError("Output data json schema"),
    },
  )
  .refine(
    (check) =>
      !(check.shouldRetryAbandonedItems || check.shouldRetryFailedItems) ||
      check.maximumRetryAttempts,
    {
      path: ["maximumRetryAttempts"],
      message: reqError("Retry count"),
    },
  );

export const queueUploadFileZodSchema = z.object({
  payloadData: z.string(),

  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

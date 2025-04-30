import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";

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

// Define a Zod schema for file validation
const jsonFileSchema = z
  .instanceof(File) // Ensure the input is a File object
  .refine(
    (file) => {
      const allowedTypes = ["application/json"];
      return allowedTypes.includes(file.type); // Validate file type
    },
    { message: "Invalid file type. Only json files are allowed." },
  )
  .refine(
    (file) => file.size <= 5 * 1024 * 1024, // Validate file size (<= 5MB)
    { message: "File size must be less than 5MB." },
  );

const numberSchema = z.coerce
  .number() // Coerce to number
  .min(0, "Retry Count must be positive") // Add validation rules
  .max(20, "Retry Count must not exceed 20");

/**
 * Represents the Zod schema for a queue.
 */
export const queueZodSchema = z.object({
  id: z.string(),
  name: queueNameSchema,
  description: z.string(),

  isUniqueReferencesEnforced: z.boolean().default(false),
  isStoredEncrypted: z.boolean().default(false),
  shouldRetryFailedItems: z.boolean().default(false),
  shouldRetryAbandonedItems: z.boolean().default(false),
  maximumRetryAttempts: numberSchema,

  specificDataSchemaFile: jsonFileSchema,
  outputDataSchemaFile: jsonFileSchema,

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

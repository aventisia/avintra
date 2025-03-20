import { z } from 'zod';

import { alphaNumericError, maxLenError, reqError } from '@/react-toolkit/utils/error-message-list';
import { alphaNumericRegex } from '@/react-toolkit/utils/regex-list';

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
    { message: "Invalid file type. Only json files are allowed." }
  )
  .refine(
    (file) => file.size <= 5 * 1024 * 1024, // Validate file size (<= 5MB)
    { message: "File size must be less than 5MB." }
  );

/**
 * Represents the Zod schema for a queue.
 */
export const queueZodSchema = z.object({
  id: z.string(),
  name: queueNameSchema,
  description: z.string().optional(),

  hasUniqueRef: z.boolean().default(false),
  isEncrypted: z.boolean().default(false),
  retryFailed: z.boolean().default(false),
  retryAbandoned: z.boolean().default(false),
  maxRetries: z.number(),

  inputJsonSchema: jsonFileSchema,
  outputJsonSchema: jsonFileSchema,

  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

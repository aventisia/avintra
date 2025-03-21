import { z } from 'zod';

import { alphaNumericError, maxLenError, reqError } from '@/react-toolkit/utils/error-message-list';
import { alphaNumericRegex } from '@/react-toolkit/utils/regex-list';

/**
 * Represents the Zod object's item schema for a keystore name.
 */
export const keystoreNameSchema = z
  .string()
  .min(1, { message: reqError("Key name") })
  .max(255, { message: maxLenError("Key name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Key name"),
  });

/**
 * Represents the Zod schema for a keystore.
 */
export const keystoreZodSchema = z.object({
  id: z.string(),
  type: z.string().min(1, { message: reqError("Key type") }),
  name: keystoreNameSchema,
  value: z
    .string()
    .max(500, { message: maxLenError("Key value", 500) }),
  isDisabled: z.boolean().default(false),
  isEncrypted: z.optional(z.boolean().default(false)),
  // Read (view) only fields
  accessLevel: z.string().min(1, { message: reqError("Access level") }),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

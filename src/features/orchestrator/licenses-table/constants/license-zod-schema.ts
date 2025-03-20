import { z } from 'zod';

import { alphaNumericError, maxLenError, reqError } from '@/react-toolkit/utils/error-message-list';
import { alphaNumericRegex } from '@/react-toolkit/utils/regex-list';

/**
 * Represents the Zod object's item schema for a license name.
 */
export const licenseNameSchema = z
  .string()
  .min(1, { message: reqError("License name") })
  .max(255, { message: maxLenError("License name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("License name"),
  });

/**
 * Represents the Zod schema for a license.
 */
export const licenseZodSchema = z.object({
  id: z.string(),
  type: z.string().min(1, { message: reqError("License type") }),
  name: licenseNameSchema,
  description: z
    .string()
    .max(500, { message: maxLenError("License description", 500) }),
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  flowCount: z.number().default(0),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

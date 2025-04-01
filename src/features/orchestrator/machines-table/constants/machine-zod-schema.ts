import { z } from 'zod';

import { alphaNumericError, maxLenError, reqError } from '@/react-toolkit/utils/error-message-list';
import { alphaNumericRegex } from '@/react-toolkit/utils/regex-list';

import { ipv4Regex, ipv6Regex } from './';

/**
 * Represents the Zod object's item schema for a machine name.
 */
export const machineNameSchema = z
  .string()
  .min(1, { message: reqError("Machine name") })
  .max(255, { message: maxLenError("Machine name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Machine name"),
  });

const ipAddressSchema = z
  .string()
  .refine(
    (value) => ipv4Regex.test(value) || ipv6Regex.test(value),
    "Invalid IP address. Must be a valid IPv4 or IPv6 address."
  );

/**
 * Represents the Zod schema for a machine.
 */
export const machineZodSchema = z.object({
  id: z.string(),
  name: machineNameSchema,
  type: z.string().min(1, { message: reqError("Machine OS type") }),
  environment: z.string().min(1, { message: reqError("Environment type") }),
  licenseType: z.string().min(1, { message: reqError("License type") }),
  ipAddress: ipAddressSchema,
  hostname: z.string({ message: reqError("Host Name") }),

  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

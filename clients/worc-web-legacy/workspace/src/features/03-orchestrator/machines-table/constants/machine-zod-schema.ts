import {
  flexibleNameError,
  flexibleNameRegex,
  maxLenError,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

import { ipv4Regex, ipv6Regex } from ".";

/**
 * Represents the Zod object's item schema for a machine name.
 */
export const machineNameSchema = z
  .string()
  .min(1, { message: reqError("Machine Name") })
  .max(255, { message: maxLenError("Machine Name", 255) })
  .regex(flexibleNameRegex, {
    message: flexibleNameError("Machine name"),
  });

const ipAddressSchema = z
  .string()
  .min(1, { message: reqError("IP Address") })
  .refine(
    (value) => ipv4Regex.test(value) || ipv6Regex.test(value),
    "Invalid IP address. Must be a valid IPv4 or IPv6 address.",
  );

/**
 * Represents the Zod schema for a machine.
 */
export const machineZodSchema = z.object({
  id: z.string(),
  name: machineNameSchema,
  type: z.string().min(1, { message: reqError("Machine OS Type") }),
  environment: z.string().min(1, { message: reqError("Environment Type") }),
  ipAddress: ipAddressSchema,
  hostname: z.string().min(1, { message: reqError("Username") }),
  osId: z.string().min(1, { message: reqError("OS Unique Id") }),

  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

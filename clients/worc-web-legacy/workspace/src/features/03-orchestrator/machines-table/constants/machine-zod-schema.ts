import {
  ipAddressError,
  ipv4Regex,
  ipv6Regex,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod schema to add/update machine.
 */
export const machineZodSchema = z.object({
  id: z.string(),

  environment: z.string().min(1, { message: reqError("Environment") }),
  operatingSystem: z.string().min(1, { message: reqError("OS Type") }),
  osID: z.string().min(1, { message: reqError("OS Unique Id") }),
  username: z.string().min(1, { message: reqError("Username") }),
  hostname: z.string().min(1, { message: reqError("Hostname") }),
  ipAddress: z
    .string()
    .refine(
      (value) =>
        value.length === 0 || ipv4Regex.test(value) || ipv6Regex.test(value),
      `${ipAddressError}`,
    ),
  name: z.string().default(""), // Read-only preview for UI purposes only. Backend generates final name.
  isDisabled: z.boolean().default(false),
});

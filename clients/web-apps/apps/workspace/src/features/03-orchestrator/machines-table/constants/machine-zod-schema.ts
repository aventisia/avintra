import {
  ipAddressError,
  ipv4Regex,
  ipv6Regex,
  reqError,
  usernameError,
  usernameRegex,
} from "@avplatform/ui/utils";
import { z } from "zod";

import { getOsIdError, isValidMachineOsId } from "../utils/machine-form-validation-util";

/**
 * Represents the Zod schema to add/update machine.
 */
export const machineZodSchema = z
  .object({
    id: z.string(),
    environment: z.string().min(1, { message: reqError("Environment") }),
    operatingSystem: z.string().min(1, { message: reqError("OS Type") }),
    osID: z
      .string()
      .trim()
      .min(1, { message: reqError("OS Unique Id") }),
    username: z
      .string()
      .trim()
      .min(1, { message: reqError("Username") })
      .max(255, { message: "Username must be 255 characters or fewer." })
      .regex(usernameRegex, {
        message: usernameError("Username"),
      }),
    hostname: z
      .string()
      .trim()
      .min(1, { message: reqError("Hostname") })
      .max(255, { message: "Hostname must be 255 characters or fewer." })
      .regex(usernameRegex, {
        message: usernameError("Hostname"),
      }),
    ipAddress: z
      .string()
      .trim()
      .refine(
        (value) => value.length === 0 || ipv4Regex.test(value) || ipv6Regex.test(value),
        ipAddressError(),
      ),
    name: z.string().default(""), // Read-only preview for UI purposes only. Backend generates final name.
    flowVersionIds: z
      .array(
        z.union([
          z.string(),
          z.object({
            flowVersionId: z.string().trim().min(1),
          }),
        ]),
      )
      .default([]),

    isDisabled: z.boolean().default(false),
  })
  .superRefine((value, context) => {
    if (!isValidMachineOsId(value.operatingSystem, value.osID)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["osID"],
        message: getOsIdError(value.operatingSystem),
      });
    }
  });

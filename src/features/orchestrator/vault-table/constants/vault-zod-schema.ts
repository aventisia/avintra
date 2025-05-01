import { z } from "zod";

import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";

/**
 * Represents the Zod object's item schema for a config name.
 */
export const vaultNameSchema = z
  .string()
  .min(1, { message: reqError("Config name") })
  .max(255, { message: maxLenError("Config name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Config name"),
  });

/**
 * Represents the Zod schema for a config.
 */
export const vaultZodSchema = z
  .object({
    id: z.string(),
    name: vaultNameSchema,
    username: z.string().min(1, { message: reqError("User name") }),
    password: z.string().min(1, { message: reqError("Password") }),
    confirmPassword: z
      .string()
      .min(1, { message: reqError("Confirm password") }),
    description: z.string().optional(),

    isDisabled: z.boolean().default(false),
    // Read (view) only fields
    createdBy: z.string(),
    createdOn: z.date(),
    lastModifiedBy: z.string(),
    lastModifiedOn: z.date(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

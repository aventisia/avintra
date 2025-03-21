import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a config name.
 */
export const keystoreNameSchema = z
  .string()
  .min(1, { message: reqError("Config name") })
  .max(255, { message: maxLenError("Config name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Config name"),
  });

/**
 * Represents the Zod schema for a config.
 */
export const keystoreZodSchema = z.object({
  id: z.string(),
  type: z.string().min(1, { message: reqError("Config type") }),
  name: keystoreNameSchema,
  value: z
    .string()
    .max(500, { message: maxLenError("Config value", 500) }),
  isDisabled: z.boolean().default(false),
  isEncrypted: z.optional(z.boolean().default(false)),
  // Read (view) only fields
  accessLevel: z.string().min(1, { message: reqError("Access level") }),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

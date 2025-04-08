import { z } from "zod";

import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";

export const roleNameSchema = z
  .string()
  .min(1, { message: reqError("Role name") })
  .max(255, { message: maxLenError("Role name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Role name"),
  });

/**
 * Represents the Zod schema for a role.
 */
export const roleZodSchema = z.object({
  id: z.string(),
  name: roleNameSchema,

  isDisabled: z.boolean(),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

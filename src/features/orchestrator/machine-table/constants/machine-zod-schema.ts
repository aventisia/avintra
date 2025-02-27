import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";
import { z } from "zod";

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

/**
 * Represents the Zod schema for a machine.
 */
export const machineZodSchema = z.object({
  id: z.string(),
  type: z.string().min(1, { message: reqError("Machine type") }),
  name: machineNameSchema,
  description: z
    .string()
    .max(500, { message: maxLenError("Machine description", 500) }),
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  flowCount: z.number().default(0),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

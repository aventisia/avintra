import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a queue name.
 */
export const queueNameSchema = z
  .string()
  .min(1, { message: reqError("Queue name") })
  .max(255, { message: maxLenError("Queue name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Queue name"),
  });

/**
 * Represents the Zod schema for a queue.
 */
export const queueZodSchema = z.object({
  id: z.string(),
  name: queueNameSchema,
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

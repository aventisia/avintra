import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a job name.
 */
export const jobNameSchema = z
  .string()
  .min(1, { message: reqError("Job name") })
  .max(255, { message: maxLenError("Job name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Job name"),
  });

/**
 * Represents the Zod schema for a job.
 */
export const jobZodSchema = z.object({
  id: z.string(),
  name: jobNameSchema,
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

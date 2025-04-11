import { z } from "zod";

import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";

/**
 * Represents the Zod object's item schema for a trigger name.
 */
export const triggerNameSchema = z
  .string()
  .min(1, { message: reqError("Trigger Name") })
  .max(255, { message: maxLenError("Trigger Name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Trigger name"),
  });

/**
 * Represents the Zod schema for a trigger.
 */
export const triggerZodSchema = z.object({
  id: z.string(),
  name: triggerNameSchema,

  process: z.string(),
  jobPriority: z.string(),
  runtimeType: z.string(),
  timeZone: z.string(),
  frequency: z.string(),
  repeateEvery: z.string(),
  nonWorkingDays: z.string(),
  scheduleEnding: z.boolean().default(false),
  scheduleAutoDisabling: z.boolean().default(false),
  generateStuckAlert: z.boolean().default(false),
  generateFailedAlert: z.boolean().default(false),

  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

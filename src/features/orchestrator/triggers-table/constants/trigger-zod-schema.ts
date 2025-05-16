import {
  alphaNumericError,
  alphaNumericRegex,
  maxLenError,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

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
  environment: z.string(),

  process: z.string().optional(),
  startsOn: z.date().optional(),

  timeZone: z.string().optional(),
  frequency: z.string().optional(),
  repeateEvery: z.string().optional(),
  repeateEveryAtHour: z.date().optional(),

  scheduleNonWorkingDays: z.boolean().optional(),
  nonWorkingDays: z.date().optional(),

  repeateEveryWeekDays: z.string().optional(),

  scheduleRetristredTimeZone: z.boolean().optional(),
  retristredTimeZoneFrom: z.date().optional(),
  retristredTimeZoneTo: z.date().optional(),

  scheduleEnding: z.boolean().optional(),
  endsOn: z.date().optional(),

  scheduleAutoDisabling: z.boolean().optional(),
  generateStuckAlert: z.boolean().optional(),
  generateFailedAlert: z.boolean().optional(),

  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

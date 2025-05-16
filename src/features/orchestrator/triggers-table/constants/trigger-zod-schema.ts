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
  assignAgents: z.string().optional(),

  timeZone: z.string().optional(),
  startsOn: z.date().optional(),

  frequency: z.string().optional(),

  //time of the trigger
  repeateAt: z.date().optional(),

  //day or weekday
  repeateOn: z.string().optional(),

  //count of the repeatation
  repeateCount: z.string().optional(),

  scheduleNonWorkingDays: z.boolean().optional(),
  nonWorkingDays: z.date().optional(), //TODO - change this to date array when calendar component capable for multiple dates

  scheduleRetristredTimeZone: z.boolean().optional(),
  restrictToTime: z.date().optional(),
  restrictFromTime: z.date().optional(),

  scheduleEnding: z.boolean().optional(),
  endsOn: z.date().optional(),

  triggerForNewItem: z.boolean().optional(),
  triggerForNewEmail: z.boolean().optional(),

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

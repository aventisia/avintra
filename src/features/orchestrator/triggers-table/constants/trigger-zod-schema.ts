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
export const triggerZodSchema = z
  .object({
    id: z.string(),
    name: triggerNameSchema,
    environment: z.string({ required_error: reqError("Environment") }),
    agentIds: z.array(z.string().optional()).optional(),

    timezone: z.string({ required_error: reqError("Time zone") }),
    startsOn: z.date({ required_error: reqError("Start on") }),

    frequency: z.string({ required_error: reqError("Start on") }),

    //time of the trigger
    repeateAt: z.date().optional(),

    //day or weekday
    repeateOn: z.array(z.string().optional()).optional(),

    //count of the repeatation
    repeateEvery: z
      .union([z.string().optional(), z.number().optional()])
      .optional(),

    hasNonWorkingDays: z.boolean().optional(),
    nonWorkingDays: z.date().optional(), //TODO - change this to date array when calendar component capable for multiple dates

    hasNonWorkingTime: z.boolean().optional(),
    nonWorkingTimeFrom: z.date().optional(),
    nonWorkingTimeTo: z.date().optional(),

    isEnds: z.boolean().optional(),
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
  })
  .refine((check) => check.frequency == "OneTime" || check.repeateAt, {
    path: ["repeateAt"],
    message: reqError("Repeate At"),
  })
  .refine(
    (check) =>
      ["OneTime", "MinuteByMinute", "Hourly", "Daily"].includes(
        check.frequency,
      ) || check.repeateOn,
    {
      path: ["repeateOn"],
      message: reqError("Repeate on"),
    },
  )
  .refine(
    (check) =>
      ["OneTime", "MinuteByMinute", "Hourly", "Daily", "Weekly"].includes(
        check.frequency,
      ) || check.repeateEvery,
    {
      path: ["repeateEvery"],
      message: reqError("Repeate every"),
    },
  )
  .refine((check) => !check.hasNonWorkingDays || check.nonWorkingDays, {
    path: ["nonWorkingDays"],
    message: reqError("Non working days"),
  })
  .refine(
    (check) =>
      !check.hasNonWorkingTime ||
      (check.nonWorkingTimeFrom && check.nonWorkingTimeTo,
      {
        path: ["nonWorkingTimeFrom", "nonWorkingTimeTo"],
        message: reqError("Non working days"),
      }),
  );

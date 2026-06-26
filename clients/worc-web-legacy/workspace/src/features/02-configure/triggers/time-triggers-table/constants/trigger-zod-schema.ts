import {
  flexibleNameError,
  flexibleNameRegex,
  maxLenError,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";

const today = new Date();
// Set today's time to midnight to ignore the time part in comparison
today.setHours(0, 0, 0, 0);

export const triggerNameSchema = z
  .string()
  .min(1, { message: reqError("Trigger Name") })
  .max(255, { message: maxLenError("Trigger Name", 255) })
  .regex(flexibleNameRegex, {
    message: flexibleNameError("Trigger name"),
  });

/**
 * Represents the Zod schema for a trigger.
 */
export const triggerZodSchema = z
  .object({
    // Unique identifier for the trigger
    id: z.string(),

    // Trigger name validation using the custom schema
    name: triggerNameSchema,

    agents: z.array(z.any()).min(1, { message: reqError("Agent(s)") }),

    // Timezone in which the trigger is set
    timezone: z.string().min(1, { message: reqError("Timezone") }),

    interval: z.string().default("1"),

    // Start date for the trigger to be effective
    effectiveDate: z
      .date()
      .min(today, { message: "Start date cannot be in the past" }),

    // Specific time when the trigger to be effective (optional)
    effectiveTime: z.string().nullable().optional(),

    // Frequency type for the trigger (enum)
    frequency: z.enum(
      Object.keys(TriggerFrequencyTypesEnum) as [string, ...string[]],
      { required_error: reqError("Frequency") },
    ),

    // Specific time when the trigger should fire (optional)
    atTime: z.string().nullable().optional(),

    // Days of the week when the trigger should fire (1=Monday, 7=Sunday)
    weekdays: z.array(z.string()).optional(),

    // Days of the month when the trigger should fire (1-31)
    monthDays: z.array(z.string()).optional(),

    // End date for when the trigger should stop (optional)
    endDate: z.date().nullable().optional(),

    // Specific time when the trigger should stop (optional)
    endTime: z.string().nullable().optional(),

    // Hours of the day to exclude from the trigger (0-23)
    exceptionHours: z.array(z.string()).optional(),

    // Weekdays to exclude from triggering (1=Monday, 7=Sunday)
    exceptionWeekdays: z.array(z.string()).optional(),

    // Specific dates to exclude from triggering
    exceptionDates: z.array(z.string()).optional(),

    // Flag to disable the trigger (optional)
    isDisabled: z.boolean().nullable().optional(),
  })
  .refine(
    (data) => {
      if (!data.endDate) return true;

      // Daily/Weekly/Monthly
      if (["Daily", "Weekly", "MonthlyDayOfMonth"].includes(data?.frequency)) {
        return data?.endDate > data?.effectiveDate;
      }

      // Hourly/MinuteByMinute
      if (["Hourly", "MinuteByMinute"].includes(data?.frequency)) {
        const start = new Date(data?.effectiveDate);
        const end = new Date(data?.endDate);

        const applyTime = (date: Date, time?: string | null) => {
          if (!time) return;
          const [hours, minutes] = time.split(":").map(Number);
          date.setHours(hours, minutes, 0, 0);
        };

        applyTime(start, data?.effectiveTime);
        applyTime(end, data?.endTime);

        const interval = Number(data?.interval) || 1;

        const minimumEnd = new Date(start);

        if (data?.frequency === "Hourly") {
          minimumEnd.setHours(minimumEnd.getHours() + interval);
        } else {
          minimumEnd.setMinutes(minimumEnd.getMinutes() + interval);
        }

        return end >= minimumEnd;
      }

      return true;
    },
    {
      message: "End date/time must be after the start date/time.",
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      if (["Daily", "Weekly", "MonthlyDayOfMonth"].includes(data.frequency)) {
        return data.atTime;
      } else return true;
    },
    {
      message: reqError("Time"),
      path: ["atTime"],
    },
  )
  .refine(
    (data) => {
      if (["Weekly"].includes(data.frequency)) {
        return data.weekdays?.length;
      } else return true;
    },
    {
      message: reqError("Atleast one day of week"),
      path: ["weekdays"],
    },
  )
  .refine(
    (data) => {
      if (["MonthlyDayOfMonth"].includes(data.frequency)) {
        return data.monthDays?.length;
      } else return true;
    },
    {
      message: reqError("Atleast one day"),
      path: ["monthDays"],
    },
  )
  .refine(
    (data) => {
      if (data?.exceptionDates && data?.exceptionDates?.length > 0) {
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
        return data?.exceptionDates?.every((date) => {
          // Check if the date matches the format and is in the future
          const isValidFormat = dateFormat.test(date);
          if (isValidFormat) {
            const dateObj = new Date(date);
            const today = new Date();
            // Ensure the date is in the future
            return dateObj > today;
          }
          return false;
        });
      } else return true;
    },
    {
      message: reqError(
        "All exception dates must be in the future and in the format YYYY-MM-DD",
      ),
      path: ["exceptionDates"],
    },
  );

import {
  flexibleNameError,
  flexibleNameRegex,
  maxLenError,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

import { TriggerFrequencyTypesEnum } from "@/enums/trigger-frequency-types-enum";

// Normalize today's date to midnight for strict date-only comparisons
const today = new Date();
today.setHours(0, 0, 0, 0);

export const triggerNameSchema = z
  .string()
  .min(1, { message: reqError("Trigger Name") })
  .max(255, { message: maxLenError("Trigger Name", 255) })
  .regex(flexibleNameRegex, {
    message: flexibleNameError("Trigger name"),
  });

/**
 * Defines the validation schema for Time Triggers.
 * Utilizes a superRefine block to handle complex, cross-field date validations
 * based on the trigger's execution frequency and current active state.
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
    effectiveDate: z.date({ required_error: reqError("Start Date") }),

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

    // Hidden property synced from the backend strictly for end-date validation accuracy
    nextTriggerTime: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const now = new Date();
    const isUpdate = !!data.id; // Determines if we are editing an existing record

    /**
     * Utility to combine independent Date and Time form fields into a single Date object.
     * Defaults to midnight if no time is provided.
     */
    const buildDateTime = (d: Date, t?: string | null) => {
      const dt = new Date(d);
      if (t) {
        const [hours, minutes] = t.split(":").map(Number);
        dt.setHours(hours, minutes, 0, 0);
      } else {
        dt.setHours(0, 0, 0, 0);
      }
      return dt;
    };

    const effectiveDateTime = buildDateTime(
      data.effectiveDate,
      data.effectiveTime,
    );

    // 1. Effective Date Check: Only enforce future dates when creating a new trigger.
    // Existing triggers are allowed to have historical start dates.
    if (!isUpdate && effectiveDateTime < now) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "Effective date and time cannot be in the past for new triggers.",
        path: ["effectiveDate"],
      });
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Time cannot be in the past.",
        path: ["effectiveTime"],
      });
    }

    // 2. End Date Validation Suite
    if (data.endDate) {
      const endDateTime = buildDateTime(data.endDate, data.endTime);

      // Rule A: End date must logically follow the start date
      if (endDateTime <= effectiveDateTime) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date/time must be after the start date/time.",
          path: ["endDate"],
        });
      }

      // Rule B: End date must not be in the past (applicable to both creates and updates)
      if (endDateTime <= now) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date/time must be in the future.",
          path: ["endDate"],
        });
      }

      // Rule C: Ensure the schedule has room to execute at least one more time.
      let nextTrigger: Date;

      if (data.nextTriggerTime) {
        // Favor the backend's exact calculation if available
        nextTrigger = new Date(data.nextTriggerTime);
      } else {
        // Fallback calculation for newly created triggers before hitting the backend
        nextTrigger = new Date(
          effectiveDateTime > now ? effectiveDateTime : now,
        );
        const intervalNum = Number(data.interval) || 1;

        if (data.frequency === "MinuteByMinute") {
          nextTrigger.setMinutes(nextTrigger.getMinutes() + intervalNum);
        } else if (data.frequency === "Hourly") {
          nextTrigger.setHours(nextTrigger.getHours() + intervalNum);
        } else if (
          ["Daily", "Weekly", "MonthlyDayOfMonth"].includes(data.frequency)
        ) {
          // Push execution to the next day for daily/weekly/monthly schedules
          nextTrigger.setDate(nextTrigger.getDate() + 1);
        }
      }

      if (endDateTime < nextTrigger) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "End date/time must be after the next scheduled execution.",
          path: ["endDate"],
        });
      }
    }
  })
  // Dependent Field Validations based on chosen frequency
  .refine(
    (data) => {
      if (["Daily", "Weekly", "MonthlyDayOfMonth"].includes(data.frequency)) {
        return !!data.atTime;
      }
      return true;
    },
    { message: reqError("Time"), path: ["atTime"] },
  )
  .refine(
    (data) => {
      if (["Weekly"].includes(data.frequency)) {
        return data.weekdays && data.weekdays.length > 0;
      }
      return true;
    },
    { message: reqError("At least one day of week"), path: ["weekdays"] },
  )
  .refine(
    (data) => {
      if (["MonthlyDayOfMonth"].includes(data.frequency)) {
        return data.monthDays && data.monthDays.length > 0;
      }
      return true;
    },
    { message: reqError("At least one day"), path: ["monthDays"] },
  )
  // Exception Dates Validation: Must be future dates in YYYY-MM-DD format
  .refine(
    (data) => {
      if (data?.exceptionDates && data.exceptionDates.length > 0) {
        const dateFormat = /^\d{4}-\d{2}-\d{2}$/;
        return data.exceptionDates.every((date) => {
          if (dateFormat.test(date)) {
            const dateObj = new Date(date);
            const currentDate = new Date();
            currentDate.setHours(0, 0, 0, 0);
            return dateObj > currentDate;
          }
          return false;
        });
      }
      return true;
    },
    {
      message: reqError(
        "All exception dates must be in the future and in the format YYYY-MM-DD",
      ),
      path: ["exceptionDates"],
    },
  );

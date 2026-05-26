import {
  flexibleNameError,
  flexibleNameRegex,
  maxLenError,
  numericError,
  numericRegex,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

const MAX_BY_PROVIDER: Record<string, number> = {
  M365: 4320, // 3 days (in minutes)
  GOOGLE: 10080, // example: 7 days
  CUSTOM: 1440, // example: 1 day
};

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
    apiKey: z.string().min(1, { message: reqError("Api Key") }),

    mailbox: z
      .string()
      .email()
      .min(1, { message: reqError("Account") }),

    folder: z.string().optional(),

    // Expiry date
    expiryDateTime: z
      .date()
      .min(today, { message: "Expiry date cannot be in the past" }),

    // Expiry time
    expiryTime: z.string().nullable().optional(),

    resubscribeEnabled: z.boolean().optional(),

    resubscribeFrequency: z
      .string()
      .regex(numericRegex, {
        message: numericError("Resubscribe Frequency"),
      })
      .min(1, { message: reqError("Resubscribe Frequency") }),
    credentialId: z.string().min(1, { message: reqError("Credential Id") }),

    provider: z.string(),

    // Flag to disable the trigger (optional)
    isDisabled: z.boolean().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const freq = Number(data.resubscribeFrequency);

    if (isNaN(freq)) return;

    const max = MAX_BY_PROVIDER[data.provider] ?? 4320; // fallback
    const min = 0;

    if (freq < min || freq > max) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["resubscribeFrequency"],
        message: `Resubscribe Frequency must be between ${min} and ${max} minutes for ${data.provider}`,
      });
    }
  });

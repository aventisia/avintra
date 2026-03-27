import {
  flexibleNameError,
  flexibleNameRegex,
  maxLenError,
  numericError,
  numericRegex,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

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
export const triggerZodSchema = z.object({
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
    .min(1, { message: reqError("Resubscribe Frequency") }),

  resubscribeFrequencyCustom: z
    .string()
    .regex(numericRegex, {
      message: numericError("Resubscribe Frequency"),
    })
    .nullable()
    .optional(),

  credentialId: z.string().min(1, { message: reqError("Credential Id") }),

  provider: z.string(),

  // Flag to disable the trigger (optional)
  isDisabled: z.boolean().nullable().optional(),
});

import {
  flexibleNameError,
  flexibleNameRegex,
  maxLenError,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a Subscription Plan.
 */
export const subPlanNameSchema = z
  .string()
  .min(1, { message: reqError("Plan Name") })
  .max(255, { message: maxLenError("Plan Name", 255) })
  .regex(flexibleNameRegex, {
    message: flexibleNameError("Plan Name"),
  });

/**
 * Represents the Zod schema for a Subscription Plans.
 */
export const subPlansZodSchema = z.object({
  id: z.string(), // UUID format validation
  name: subPlanNameSchema,
  maxCredits: z
    .string({ message: reqError("No of credits") })
    .min(1, { message: reqError("No of credits") })
    .transform((val) => Number(val)),
  maxPublishedItems: z
    .string({ message: reqError("Published") })
    .min(1, { message: reqError("Published") })
    .transform((val) => Number(val)),
  historyRetentionDays: z
    .string({ message: reqError("Days") })
    .min(1, { message: reqError("Days") })
    .transform((val) => Number(val)),
  maxSpaces: z
    .string({ message: reqError("Spaces") })
    .min(1, { message: reqError("Spaces") })
    .transform((val) => Number(val)),
  storageLimitMB: z
    .string({ message: reqError("Storage Limit") })
    .min(1, { message: reqError("Storage Limit") })
    .transform((val) => Number(val)),
  maxUsers: z
    .string({ message: reqError("Users") })
    .min(1, { message: reqError("Users") })
    .transform((val) => Number(val)),
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

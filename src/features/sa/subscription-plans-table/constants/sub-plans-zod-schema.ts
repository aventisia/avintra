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
  maxCredits: z.number().min(1, { message: reqError("No of credits") }),
  maxPublishedItems: z.number().min(1, { message: reqError("Field") }),
  historyRetentionDays: z.number().min(1, { message: reqError("No of Days") }),
  maxSpaces: z.number().min(1, { message: reqError("Spaces") }),
  storageLimitMB: z.number().min(1, { message: reqError("Storage Limit") }),
  maxUsers: z.number().min(1, { message: reqError("No of Users") }),
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

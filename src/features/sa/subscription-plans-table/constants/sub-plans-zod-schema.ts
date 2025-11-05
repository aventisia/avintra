import { maxLenError, reqError } from "@aventisia/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a Subscription Plan.
 */
export const subPlanNameSchema = z
  .string()
  .min(1, { message: reqError("Plan Name") })
  .max(255, { message: maxLenError("Plan Name", 255) })
  .regex(/^[a-zA-Z0-9 ()_-]+$/, {
    message:
      "Plan Name can only contain letters, numbers, spaces, hyphens (-), underscores (_), and parentheses ( )",
  });

//To use Text field for numbers schema
const numberTextFieldSchema = z
  .string({ coerce: true })
  .min(1, { message: "Field is required" })
  .refine((num) => !isNaN(Number(num)), {
    message: "Only number allowed",
  })
  .transform((val) => Number(val));

/**
 * Represents the Zod schema for a Subscription Plans.
 */
export const subPlansZodSchema = z.object({
  id: z.string(),
  name: subPlanNameSchema,
  type: z.string(),
  status: z.string(),
  price: numberTextFieldSchema.refine((num) => num >= 0, {
    message: "Value must be greater than or equal to 0",
  }),
  currency: z.string().min(1, { message: reqError("Currency") }),
  frequency: z.string(),
  maxCredits: numberTextFieldSchema.refine((num) => num >= -1, {
    message: "Value must be greater than or equal to -1",
  }),
  maxPublishedItems: numberTextFieldSchema.refine((num) => num >= 0, {
    message: "Value must be greater than or equal to 0",
  }),
  historyRetentionDays: numberTextFieldSchema.refine((num) => num >= 0, {
    message: "Value must be greater than or equal to 0",
  }),
  maxSpaces: numberTextFieldSchema.refine((num) => num >= -1, {
    message: "Value must be greater than or equal to -1",
  }),
  storageLimitMB: numberTextFieldSchema.refine((num) => num >= -1, {
    message: "Value must be greater than or equal to -1",
  }),
  maxUsers: numberTextFieldSchema.refine((num) => num >= -1, {
    message: "Value must be greater than or equal to -1",
  }),
  isDisabled: z.boolean().default(false),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

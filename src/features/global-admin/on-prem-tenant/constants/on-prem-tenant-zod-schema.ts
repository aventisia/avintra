import {
  flexibleNameError,
  flexibleNameRegex,
  maxLenError,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a onPremTenant name.
 */
export const onPremTenantNameSchema = z
  .string()
  .min(1, { message: reqError("Tenant name") })
  .max(255, { message: maxLenError("Tenant name", 255) })
  .regex(flexibleNameRegex, {
    message: flexibleNameError("Tenant name"),
  });

//To use Text field for numbers schema
const numberTextFieldSchema = z
  .string({ coerce: true })
  .min(1, { message: reqError("Execution Time Allowed") })
  .refine((num) => !isNaN(Number(num)), {
    message: "Only number allowed",
  })
  .transform((val) => Number(val));

/**
 * Represents the Zod schema for a onPremTenant.
 */
export const onPremTenantZodSchema = z.object({
  id: z.string(),
  name: onPremTenantNameSchema,
  type: z.string().min(1, { message: reqError("Tenant type") }),
  executionTimeAllowed: numberTextFieldSchema.refine((num) => num >= 0, {
    message: "Value must be greater than or equal to 0",
  }),
  contractStartDate: z.date({ message: reqError("Contract Start Date") }),
  contractRenewalDate: z.date({ message: reqError("Contract Renewal Date") }),
  isExecutionDisabled: z.boolean().default(false),
  isLoginDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdByUser: z.string(),
  createdOn: z.date(),
  lastModifiedByUser: z.string(),
  lastModifiedOn: z.date(),
});

import { flexibleNameError, flexibleNameRegex, maxLenError, reqError } from "@avplatform/ui/utils";
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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const emailListSchema = z
  .string()
  .trim()
  .min(1, "Email cannot be empty")
  .refine(
    (val) => {
      const emails = val
        .split(";")
        .map((e) => e.trim())
        .filter(Boolean);

      return emails.length > 0;
    },
    { message: "At least one email is required" },
  )
  .refine(
    (val) => {
      const emails = val
        .split(";")
        .map((e) => e.trim())
        .filter(Boolean);

      return emails.every((email) => emailRegex.test(email));
    },
    (val) => {
      const emails = val
        .split(";")
        .map((e) => e.trim())
        .filter(Boolean);

      const invalidEmail = emails.find((email) => !emailRegex.test(email));

      return {
        message: `Invalid email format: "${invalidEmail}"`,
      };
    },
  );

//const today = new Date();

/**
 * Represents the Zod schema for a onPremTenant.
 */
export const onPremTenantZodSchema = z.object({
  id: z.string(),
  name: onPremTenantNameSchema,
  type: z.string().min(1, { message: reqError("Tenant type") }),
  executionTimeAllowed: numberTextFieldSchema.refine((num) => num > 0, {
    message: "Value must be greater than 0",
  }),
  contractStartDate: z.date({ message: reqError("Contract Start Date") }),
  //.min(today, { message: "Contract start date cannot be in the past" }),

  contractRenewalDate: z.date({ message: reqError("Contract Renewal Date") }),
  isExecutionDisabled: z.boolean().default(false),
  isLoginDisabled: z.boolean().default(false),
  ourEmails: emailListSchema,
  tenantEmails: emailListSchema,
  // Read (view) only fields
  createdByUser: z.string(),
  createdOn: z.date(),
  lastModifiedByUser: z.string(),
  lastModifiedOn: z.date(),
});
// .refine(
//   (data) =>
//     data.contractRenewalDate !== undefined &&
//     data.contractRenewalDate > data?.contractStartDate,
//   {
//     message: "Contract renewal date must be after start date",
//     path: ["contractRenewalDate"],
//   },
// );

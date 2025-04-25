import { z } from "zod";

import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import {
  alphaNumericRegex,
  positiveFloatNumber,
} from "@/react-toolkit/utils/regex-list";

/**
 * Represents the Zod object's item schema for a pricingplan name.
 */
export const pricingPlanNameSchema = z
  .string()
  .min(1, { message: reqError("Plan name") })
  .max(100, { message: maxLenError("Plan name", 100) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Plan name"),
  });

/**
 * Represents the Zod schema for a pricingplan.
 */
export const pricingPlanZodSchema = z
  .object({
    id: z.string().optional(),
    tenantId: z.string().optional().nullable(),
    type: z.string({ required_error: reqError("Pricing type") }),
    pricingComponent: z
      .string({ message: reqError("Pricing component") })
      .min(1, { message: reqError("Pricing component") }),
    tenantType: z
      .string({ message: reqError("Deployment type") })
      .min(1, { message: reqError("Deployment type") }),
    currency: z
      .string({ message: reqError("Currency") })
      .min(1, { message: reqError("Currency") }),
    unitPrice: z.union([
      z.number({ required_error: reqError("Unit price") }),
      z
        .string({ required_error: reqError("Unit price") })
        .refine(
          (check) => positiveFloatNumber.test(check),
          "Enter correct value for Unit price",
        )
        .transform((val) => parseFloat(val)),
    ]),
    frequency: z
      .string({ message: reqError("Billing frequency") })
      .min(1, { message: reqError("Billing frequency") }),
    cola: z.union([
      z.number({ required_error: reqError("COLA") }),
      z
        .string({ required_error: reqError("COLA") })
        .refine(
          (check) => positiveFloatNumber.test(check),
          "Enter correct value for COLA",
        )
        .transform((val) => parseInt(val)),
    ]),

    // Single field
    isDisabled: z.boolean(),
    // Group (read-only)
    createdBy: z.string(),
    createdOn: z.date(),
    lastModifiedBy: z.string(),
    lastModifiedOn: z.date(),
  })

  .refine((data) => data.type != "default", {
    path: ["tenantId"],
    message: reqError("Tenant Name"),
  })
  .refine((data) => data.unitPrice > 0 && data.unitPrice <= 100000000, {
    message: "Unit price must be above 0",
    path: ["unitPrice"],
  })
  .refine((data) => data.cola > 0 && data.cola <= 100, {
    message: "COLA must between 1 to 100",
    path: ["cola"],
  });

import { z } from "zod";

import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";

/**
 * Represents the Zod object's item schema for a pricingplan name.
 */
export const pricingPlanNameSchema = z
  .string()
  .min(1, { message: reqError("PricingPlan name") })
  .max(100, { message: maxLenError("PricingPlan name", 100) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("PricingPlan name"),
  });

/**
 * Represents the Zod schema for a pricingplan.
 */
export const pricingPlanZodSchema = z
  .object({
    // Single fields
    id: z.string().optional(),
    tenantId: z.string().optional(),
    pricingComponent: z
      .string({ message: reqError("Pricing Component") })
      .min(1, { message: reqError("Pricing Component") }),
    tenantType: z
      .string({ message: reqError("Tenant Type") })
      .min(1, { message: reqError("Tenant Type") }),
    // tenantName: z.string().optional(),
    currency: z
      .string({ message: reqError("Currency") })
      .min(1, { message: reqError("Currency") }),
    unitPrice: z.string().min(1, { message: reqError("Unit Price") }),
    // .transform((val) => Number(val))
    // .pipe(z.number().positive("Unit price must be positive"))
    frequency: z
      .string({ message: reqError("Billing Frequency") })
      .min(1, { message: reqError("Billing Frequency") }),
    cola: z.string().min(1, { message: reqError("COLA") }),
    // .transform((val) => Number(val))
    // .pipe(z.number().positive("COLA must be positive"))
    // Single field
    isDisabled: z.boolean(),
    // Group (read-only)
    createdBy: z.string(),
    createdOn: z.date(),
    lastModifiedBy: z.string(),
    lastModifiedOn: z.date(),
  })
  .refine((data) => data.unitPrice && Number(data.unitPrice) > 0, {
    message: "Unit Price must be greater than 0",
    path: ["unitPrice"],
  })
  .refine(
    (data) => data.cola && Number(data.cola) > 0 && Number(data.cola) < 100,
    {
      message: "COLA must between 0 to 100",
      path: ["cola"],
    },
  );

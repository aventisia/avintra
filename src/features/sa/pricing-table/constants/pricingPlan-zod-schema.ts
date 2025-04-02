import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";
import { z } from "zod";

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
export const pricingPlanZodSchema = z.object({
  // Single fields
  id: z.string().optional(),
  name: z.string({ message: reqError("Pricing Component") }),
  tenantType: z.string({ message: reqError("Tenant Type") }),
  tenantName: z.string({ message: reqError("Tenant Name") }),
  currency: z.string({ message: reqError("currency") }),
  unit: z.string({ message: reqError("unit") }),
  unitPrice: z.coerce
    .number({ message: reqError("Unit Price") })
    .positive({ message: "Price must be positive." }),
  frequency: z.string({ message: reqError("Billing Frequency") }),
  cola: z.coerce
    .number({ message: reqError("COLA") })
    .positive({ message: reqError("COLA must be positive") }),
  // Single field
  isDisabled: z.boolean(),
  // Group (read-only)
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

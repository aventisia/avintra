import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a billingplan name.
 */
export const inoviceNameSchema = z
  .string()
  .min(1, { message: reqError("BillingPlan name") })
  .max(100, { message: maxLenError("BillingPlan name", 100) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("BillingPlan name"),
  });

/**
 * Represents the Zod schema for a billingplan.
 */
export const billingAddressZodSchema = z.object({
  // Single fields
  id: z.string().optional(),
  name: z.string({ message: reqError("Name") }),
  email: z.string({ message: reqError("Email") }).email(),
  addressLine1: z.string({ message: reqError("Address Line 1") }),
  addressLine2: z.string({ message: reqError("Address Line 2") }),
  addressLine3: z.string().optional(),
  city: z.string({ message: reqError("City") }),
  state: z.string({ message: reqError("State") }),
  country: z.string({ message: reqError("Country") }),
  taxId: z.string().optional(),
  pinCode: z.string({ message: reqError("Pin Code") }),
  // Single field
  isDisabled: z.boolean(),
  // Group (read-only)
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

import { reqError } from "@/react-toolkit/utils/error-message-list";

import { z } from "zod";

/**
 * Represents the Zod schema for a billingplan.
 */
export const billingAddressZodSchema = z.object({
  // Single fields
  id: z.string().optional(),
  name: z.string().min(1, { message: reqError("Name") }),
  email: z
    .string()
    .min(1, { message: reqError("Email") })
    .email(),
  addressLine1: z.string().min(1, { message: reqError("Address line 1") }),
  addressLine2: z.string().optional(),
  city: z.string().min(1, { message: reqError("City") }),
  state: z.string().min(1, { message: reqError("State") }),
  country: z.string().min(1, { message: reqError("Country") }),
  taxId: z.string().optional(),
  pinCode: z.string().min(1, { message: reqError("Pin code") }),
  // Single field
  isDisabled: z.boolean(),
  // Group (read-only)
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

import { maxLenError } from "@avplatform/ui/utils";
import { z } from "zod";

export const BillingAddressZodSchema = z.object({
  tenantName: z.optional(z.string()),
  designantion: z.optional(z.string()),
  addressLine1: z.optional(
    z.string().max(200, { message: maxLenError("Address is required", 200) }),
  ),
  addressLine2: z.optional(z.string()),
  country: z.optional(z.string({ required_error: "Please select the country." })),
  stateOrProvince: z.optional(z.string({ required_error: "Please enter your state." })),
  city: z.optional(z.string({ required_error: "Please enter your city." })),
  zipOrPostalCode: z.optional(
    z.string({ required_error: "Please enter your Zip or Postal Code." }),
  ),
});

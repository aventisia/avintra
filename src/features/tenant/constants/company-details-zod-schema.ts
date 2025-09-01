import { z } from "zod";

export const companyDetailsZodSchema = z.object({
    companyName: z.string(),
    billingEmail:  z.string(),
    address1: z.string(),
    address2: z.string(),
    city: z.string(),
    pinCode: z.string(),
    state: z.string(),
    country: z.string(),
    gstNumber: z.string()
});


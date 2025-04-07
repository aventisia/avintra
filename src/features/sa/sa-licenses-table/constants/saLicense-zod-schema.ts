import { z } from "zod";

import { reqError } from "@/react-toolkit/utils/error-message-list";

/**
 * Represents the Zod schema for a request license units.
 */
export const recordPaymentZodSchema = z.object({
  id: z.string(),
  planId: z
    .string({ message: reqError("License Type") })
    .min(1, { message: reqError("License Type") }),
  dateReceived: z.date(),
  writeOffRemainingDues: z.boolean().optional(),
  additionalUnitsRequested: z.number().optional(),
  amountReceived: z
    .string({ message: reqError("Amount Received") })
    .min(1, { message: reqError("Amount Received") })
    .transform((val) => Number(val))
    .pipe(z.number().positive("amount must be positive")),
});

export const requestLicenseZodSchema = z.object({
  id: z
    .string({ message: reqError("Tenant Name") })
    .min(1, { message: reqError("Tenant Name") }),
  planId: z
    .string({ message: reqError("License Type") })
    .min(1, { message: reqError("License Type") }),
  additionalUnitsRequested: z
    .string({ message: reqError("New Allocated Units") })
    .min(1, { message: reqError("New Allocated Units") })
    .transform((val) => Number(val))
    .pipe(z.number().positive("New Allocated Units must be positive")),
});

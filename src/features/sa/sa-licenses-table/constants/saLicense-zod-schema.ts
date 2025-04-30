import {
  numericError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { z } from "zod";

/**
 * Represents the Zod schema for a request license units.
 */
export const recordPaymentZodSchema = z.object({
  id: z.string(),
  planId: z
    .string({ message: reqError("License type") })
    .min(1, { message: reqError("License type") }),
  dateReceived: z.date(),
  writeOffRemainingDues: z.boolean().optional(),
  additionalUnitsRequested: z.number().optional(),
  amountReceived: z
    .string({ message: reqError("Amount received") })
    .min(1, { message: reqError("Amount received") })
    .transform((val) => Number(val))
    .pipe(z.number().positive("Amount must be positive")),
});

export const requestLicenseZodSchema = z.object({
  id: z
    .string({ message: reqError("Tenant name") })
    .min(1, { message: reqError("Tenant name") }),
  planId: z
    .string({ message: reqError("License type") })
    .min(1, { message: reqError("License type") }),
  additionalUnitsRequested: z
    .string({ required_error: reqError("New Allocated Units") })
    .refine(
      (check) => RegExp(REGEXP_ONLY_DIGITS).test(check),
      numericError("New Allocated Units"),
    )
    .transform((val) => parseInt(val)),
});

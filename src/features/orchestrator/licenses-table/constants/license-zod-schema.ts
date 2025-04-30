import {
  numericError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { z } from "zod";

/**
 * Represents the Zod schema for a request license units.
 */
export const licenseZodSchema = z.object({
  id: z.string(),
  planId: z
    .string({ message: reqError("License Type") })
    .min(1, { message: reqError("License Type") }),
  additionalUnitsRequested: z
    .string({ required_error: reqError("New Allocated Units") })
    .refine(
      (check) => RegExp(REGEXP_ONLY_DIGITS).test(check),
      numericError("New Allocated Units"),
    )
    .transform((val) => parseInt(val)),
});

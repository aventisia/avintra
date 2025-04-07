import { z } from "zod";

import { reqError } from "@/react-toolkit/utils/error-message-list";

/**
 * Represents the Zod schema for a request license units.
 */
export const licenseZodSchema = z.object({
  id: z.string(),
  planId: z
    .string({ message: reqError("License Type") })
    .min(1, { message: reqError("License Type") }),
  additionalUnitsRequested: z
    .string({ message: reqError("New Allocated Units") })
    .min(1, { message: reqError("New Allocated Units") })
    .transform((val) => Number(val))
    .pipe(z.number().positive("Requested units must be positive")),
});

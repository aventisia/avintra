import { z } from "zod";

import { reqError } from "@/react-toolkit/utils/error-message-list";

/**
 * Represents the Zod schema for a request license units.
 */
export const saLicenseZodSchema = z.object({
  id: z.string(),
  planId: z.string().min(1, { message: reqError("Pricing Component") }),
  additionalUnitsRequested: z
    .string({ message: reqError("New Allocated Units") })
    .transform((val) => Number(val))
    .pipe(z.number().positive("Requested units must be positive")),

  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

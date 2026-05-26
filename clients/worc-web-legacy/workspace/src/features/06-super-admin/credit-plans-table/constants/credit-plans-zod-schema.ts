import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod schema for a credits Plans.
 */
export const creditPlansZodSchema = z.object({
  id: z.string(),
  serviceType: z.string().min(1, { message: reqError("Service Type") }),
  unitType: z.string().min(1, { message: reqError("Unit Type") }),
  oneUnit: z.number().min(0, { message: reqError("One Unit") }),
  credits: z.number().min(0, { message: reqError("Credits") }),
  isDisabled: z.boolean().optional().default(false),
});

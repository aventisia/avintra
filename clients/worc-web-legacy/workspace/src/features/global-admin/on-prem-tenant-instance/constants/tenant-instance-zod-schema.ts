import {
  flexibleNameError,
  flexibleNameRegex,
  maxLenError,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a tenantInstance name.
 */
export const tenantInstanceNameSchema = z
  .string()
  .min(1, { message: reqError("Instance name") })
  .max(255, { message: maxLenError("Instance name", 255) })
  .regex(flexibleNameRegex, {
    message: flexibleNameError("Instance name"),
  });

/**
 * Represents the Zod schema for a tenantInstance.
 */
export const tenantInstanceZodSchema = z.object({
  id: z.string(),
  name: tenantInstanceNameSchema,
  type: z.string().min(1, { message: reqError("Instance type") }),
  isDisabled: z.boolean().optional(),
});

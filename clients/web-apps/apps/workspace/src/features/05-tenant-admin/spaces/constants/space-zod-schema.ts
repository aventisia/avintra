import { maxLenError, nameError, nameRegex, reqError } from "@avplatform/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod schema for a space.
 */
export const spaceZodSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(1, { message: reqError("Space name") })
    .max(20, { message: maxLenError("Space name", 20) })
    .regex(nameRegex, {
      message: nameError("Space name"),
    }),
  description: z
    .string()
    .max(500, { message: maxLenError("Description", 500) })
    .optional(),
  isDisabled: z.boolean(),
  isDefault: z.boolean(),
  // Read (view) only fields
  totalUsers: z.number().optional(),
  totalPublishedAgents: z.number().optional(),
  totalExecutionTime: z.number().optional(),
  totalMachinesAttached: z.number().optional(),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

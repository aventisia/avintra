import { z } from "zod";
/**
 * Represents the Zod schema for a machine.
 */
export const machineFlowZodSchema = z.object({
  id: z.string(),
  flowVersionId: z.string(),
  machineId: z.string(),

  // Read (view) only fields  
  type: z.string(),
  name: z.string(),
  ipAddress: z.string(),
  hostname: z.string(),
  isDisabled: z.boolean(),
  isAvailable: z.boolean(),

  environment: z.string(),
  status: z.string(),
  currentTask: z.string(),

  createdBy: z.string(),
  createdOn: z.date(),
  lastCheckedIn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

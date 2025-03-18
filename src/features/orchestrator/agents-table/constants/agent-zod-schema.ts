import { z } from "zod";


/**
 * Represents the Zod schema for a agent.
 */
export const agentZodSchema = z.object({
  id: z.string().optional(),
  flowId: z.string().optional(),
  name: z.string().optional(),
  isLocked: z.boolean().optional(),
  isDraft: z.boolean().optional(),
  isPublished: z.boolean().optional(),
  isArchived: z.boolean().optional(),
  createdBy: z.string().optional(),
  createdByUsername: z.string().optional(),
  createdOn: z.date().optional(),
  createdByUserInitials: z.string().optional(),
  versionNumber: z.number().optional(),
  lastModifiedBy: z.string().optional(),
  lastModifiedOn: z.date().optional(),
  machineCount: z.number().optional(),
});
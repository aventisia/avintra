import { z } from "zod";

/**
 * Represents the Zod schema for a agent.
 */
export const agentZodSchema = z.object({
  id: z.string(),
  flowId: z.string(),
  name: z.string(),
  licenseId: z.string(),
  versionNumber: z.number(),
  machineCount: z.number(),

  // isLocked: z.boolean(),
  // isDraft: z.boolean(),
  // isPublished: z.boolean(),
  // isArchived: z.boolean(),

  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

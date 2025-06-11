import * as z from "zod";

const scheduleInfoSchema = z.object({
  timezone: z.string().optional().nullable(),
  scheduledAt: z.date().optional().nullable(),
});

export const addRecordsFormZodSchema = z.object({
  mlModelId: z.string().readonly(),
  fileIds: z.array(z.string()).default([]),
  scheduleInfo: scheduleInfoSchema.nullable().default(null),
});

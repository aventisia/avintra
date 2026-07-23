import { reqError } from "@avplatform/ui/utils";
import { z } from "zod";

import { JobPriorityEnum, JobStatusEnum, TriggerTypesEnum } from "..";

export const jobZodSchema = z.object({
  id: z.string(),
  flowVersionId: z.string().min(1, { message: reqError("Agent Id") }),
  triggerType: z.nativeEnum(TriggerTypesEnum, {
    message: reqError("Trigger Type"),
  }),
  priority: z.nativeEnum(JobPriorityEnum, {
    message: reqError("Priority"),
  }),
  status: z.nativeEnum(JobStatusEnum).optional(),
  retryCount: z.coerce.number().int().min(0),
  createdByName: z.string().optional(),
  createdById: z.string().optional(),
  executionLocation: z.string().min(1, { message: reqError("Execution Location") }),
  remarks: z.string().optional(),
  jobInputData: z.record(z.string(), z.unknown()).optional(),
  jobOutputData: z.record(z.string(), z.unknown()).optional(),
  lastNodeLog: z.record(z.string(), z.unknown()).optional(),
});

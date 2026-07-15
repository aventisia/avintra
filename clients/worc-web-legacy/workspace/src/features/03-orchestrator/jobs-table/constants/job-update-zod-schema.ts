import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

import { JobPriorityEnum, JobStatusEnum, TriggerTypesEnum } from "..";

const jsonStringSchema = z
  .string()
  .optional()
  .refine(
    (value) => {
      if (!value || value.trim() === "") return true;
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Invalid JSON" },
  );

export const jobInsertZodSchema = z.object({
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
  executionLocation: z
    .string()
    .min(1, { message: reqError("Execution Location") }),
  remarks: z.string().optional(),
  jobInputData: jsonStringSchema,
  jobOutputData: jsonStringSchema,
  lastNodeLog: jsonStringSchema,
});

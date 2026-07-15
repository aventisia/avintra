import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

import { JobPriorityEnum, TriggerTypesEnum } from "..";

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
  flowVersionId: z.string().min(1, { message: reqError("Agent Id") }), // OM can search and select only published from crud dialog. however endpoint support creation for unpublished flow version as well. so we are not restricting it here.l
  triggerType: z.nativeEnum(TriggerTypesEnum, {
    message: reqError("Trigger Type"),
  }), // Default, non editable value "None" will be set
  priority: z.nativeEnum(JobPriorityEnum, {
    message: reqError("Priority"),
  }), // Default, non editable value "Normal" will be set
  createdByName: z.string().optional(), // OM name. e.g. Gaurav Kumar (gaurav@aventisia.com)
  createdById: z.string().optional(), // OM id e.g. valid Guid
  executionLocation: z
    .string()
    .min(1, { message: reqError("Execution Location") }), // Display Name is going to be machines since manual creation can only be machines and not agent builder (web) or agent builder (desktop) OM can select from dropdown from all available machines
  remarks: z.string().optional(), // OM can set anything
  jobInputData: jsonStringSchema, // valid json
  jobId: z.string().optional(), // Optional job id to create the job with retryCount > 0. If provided, the job id will remain the same but retry count > 0. Also, jobId should exist in the database for the same flowVersionId. If not provided, a new job id will be generated and retry count will be 0.
});

import { reqError, uuidv4Regex } from "@aventisia/ui/utils";
import { z } from "zod";

import { JobPriorityEnum, TriggerTypesEnum } from "..";

const optionalJsonStringSchema = z
  .string()
  .refine(
    (value) => {
      if (value.trim() === "") return true;
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Input Data must be a valid JSON" },
  );

const optionalUuidSchema = z
  .string()
  .trim()
  .optional()
  .refine(
    (value) => {
      if (!value || value.trim() === "") return true;
      return uuidv4Regex.test(value);
    },
    { message: "Existing Job Id must be a valid UUIDv4." },
  );

/**
 * Async single-select fields store the selected item object at runtime, while
 * the API expects only the identifier string. This helper extracts the string
 * id when an object is selected and leaves primitive values untouched.
 */
const extractSelectedId = (value: unknown, idKey: string): unknown => {
  if (value && typeof value === "object" && idKey in value) {
    return (value as Record<string, unknown>)[idKey];
  }
  return value;
};

/**
 * Zod schema for the create job form.
 */
export const jobCreateZodSchema = z
  .object({
    flowVersionId: z.preprocess(
      (value) => extractSelectedId(value, "flowVersionId"),
      z.string().min(1, { message: reqError("Agent") }),
    ),
    triggerType: z.nativeEnum(TriggerTypesEnum, {
      message: reqError("Trigger Type"),
    }),
    priority: z.nativeEnum(JobPriorityEnum, {
      message: reqError("Priority"),
    }),
    executeOnCloud: z.boolean().default(true),
    executionLocation: z.preprocess(
      (value) => extractSelectedId(value, "machineId"),
      z.string().default(""),
    ),
    jobInputData: optionalJsonStringSchema,
    existingJobId: optionalUuidSchema,
  })
  .superRefine((value, context) => {
    if (value.executeOnCloud) return;

    if (!value.executionLocation || value.executionLocation.trim() === "") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["executionLocation"],
        message: reqError("Machine"),
      });
    }
  });

export type JobCreateFormData = z.infer<typeof jobCreateZodSchema>;

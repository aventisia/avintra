import { type ISelectOption } from "@avplatform/ui/types";
import { reqError, uuidv4Regex } from "@avplatform/ui/utils";
import { z } from "zod";

import { JobPriorityEnum, TriggerTypesEnum } from "..";
import { CLOUD_UNSUPPORTED_ERROR, isCloudExecutionBlocked } from "./cloud-execution.constant";

const optionalJsonStringSchema = z.string().refine(
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

const getFlowVersionId = (value: unknown): string => {
  const id = extractSelectedId(value, "value");
  return typeof id === "string" ? id.trim() : "";
};

const getFlowVersionPlatform = (value: unknown): string | undefined => {
  if (value && typeof value === "object" && "supportedPlatform" in value) {
    const platform = (value as { supportedPlatform?: unknown }).supportedPlatform;
    return typeof platform === "string" ? platform : undefined;
  }
  return undefined;
};

/**
 * Zod schema for the create job form.
 */
export const jobCreateZodSchema = z
  .object({
    flowVersionId: z.custom<string | ISelectOption>((value) => getFlowVersionId(value).length > 0, {
      message: reqError("Agent"),
    }),
    triggerType: z.nativeEnum(TriggerTypesEnum, {
      message: reqError("Trigger Type"),
    }),
    priority: z.nativeEnum(JobPriorityEnum, {
      message: reqError("Priority"),
    }),
    executeOnCloud: z.boolean().default(true),
    executionLocation: z.preprocess(
      (value) => extractSelectedId(value, "label"),
      z.string().default(""),
    ),
    jobInputData: optionalJsonStringSchema,
    existingJobId: optionalUuidSchema,
  })
  .superRefine((value, context) => {
    if (value.executeOnCloud) {
      if (
        getFlowVersionId(value.flowVersionId) &&
        isCloudExecutionBlocked(getFlowVersionPlatform(value.flowVersionId))
      ) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["executeOnCloud"],
          message: CLOUD_UNSUPPORTED_ERROR,
        });
      }
      return;
    }

    if (!value.executionLocation || value.executionLocation.trim() === "") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["executionLocation"],
        message: reqError("Machine"),
      });
    }
  });

type JobCreateFormData = {
  flowVersionId: string | ISelectOption;
  triggerType: TriggerTypesEnum;
  priority: JobPriorityEnum;
  executeOnCloud: boolean;
  executionLocation: string | ISelectOption;
  jobInputData: string;
  existingJobId?: string;
};

export type { JobCreateFormData };

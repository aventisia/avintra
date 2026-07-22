import { reqError } from "@aventisia/ui/utils";
import { z } from "zod";

import { JobPriorityEnum, JobStatusEnum } from "..";

import { CLOSING_JOB_STATUSES } from "./variables";

/**
 * Zod schema for the update job form. Only the fields shown in the update
 * dialog are validated.
 */
export const jobUpdateZodSchema = z
  .object({
    id: z.string(),
    priority: z.nativeEnum(JobPriorityEnum, {
      message: reqError("Priority"),
    }),
    remarks: z.string().default(""),
    isClosingStatusEnabled: z.boolean().default(false),
    closingStatus: z.nativeEnum(JobStatusEnum).optional(),
  })
  .superRefine((value, context) => {
    if (!value.isClosingStatusEnabled) return;

    if (!value.closingStatus) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["closingStatus"],
        message: reqError("Closing Status"),
      });
      return;
    }

    if (!CLOSING_JOB_STATUSES.includes(value.closingStatus)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["closingStatus"],
        message: "Selected status is not a valid closing status.",
      });
    }

    if (!value.remarks || value.remarks.trim() === "") {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["remarks"],
        message: reqError("Remarks"),
      });
    }
  });

export type JobUpdateFormData = z.infer<typeof jobUpdateZodSchema>;

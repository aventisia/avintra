import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a project name.
 */
export const projectNameSchema = z
  .string()
  .min(1, { message: reqError("Project name") })
  .max(255, { message: maxLenError("Project name", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Project name"),
  });

/**
 * Represents the Zod schema for a project.
 */
export const projectZodSchema = z.object({
  id: z.string(),
  type: z.string().min(1, { message: reqError("Project type") }),
  name: projectNameSchema,
  description: z
    .string()
    .max(500, { message: maxLenError("Project description", 500) }),
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  flowCount: z.number().default(0),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

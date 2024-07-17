import { z } from "zod";
import {
  maxLenError,
  reqError,
  alphaNumericRegex,
  alphaNumericError,
} from "@/react-toolkit/components/form";

/**
 * Represents the Zod schema for a project.
 */
export const projectZodSchema = z.object({
  id: z.string(),
  type: z.string().min(1, { message: reqError("Project type") }),
  name: z
    .string()
    .min(1, { message: reqError("Project name") })
    .max(255, { message: maxLenError("Project name", 255) })
    .regex(alphaNumericRegex, {
      message: alphaNumericError("Project name"),
    }),
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

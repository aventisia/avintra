import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/ui/form/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/ui/form/utils/regex-list";
import { z } from "zod";

/**
 * Represents the Zod schema for a flow.
 */
export const flowZodSchema = z.object({
  id: z.string(),
  type: z.string().min(1, { message: reqError("Flow type") }),
  name: z
    .string()
    .min(1, { message: reqError("Flow name") })
    .max(255, { message: maxLenError("Flow name", 255) })
    .regex(alphaNumericRegex, {
      message: alphaNumericError("Flow name"),
    }),
  description: z
    .string()
    .max(500, { message: maxLenError("Flow description", 500) }),
  thumbnail: z.string(),
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  flowCommentCount: z.number().default(0),
  projectId: z.string(),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

import { maxLenError, reqError } from "@avplatform/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod schema for a flow comment.
 */
export const flowCommentZodSchema = z.object({
  id: z.string(),
  comment: z
    .string()
    .min(1, { message: reqError("Comment") })
    .max(500, { message: maxLenError("Comment", 500) }),
  // Read (view) only fields
  flowId: z.string(),
  userFullName: z.string(),
  userName: z.string(),
  avatarSrc: z.string().optional(),
  initials: z.string().optional(),
  createdOn: z.date(),
  isEdited: z.boolean(),
});

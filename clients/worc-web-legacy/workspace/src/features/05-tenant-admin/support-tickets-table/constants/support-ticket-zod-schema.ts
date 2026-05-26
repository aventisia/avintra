import {
  alphaNumericError,
  alphaNumericRegex,
  maxLenError,
  reqError,
} from "@aventisia/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod schema for a support ticket remark.
 */
export const supportTicketRemarksZodSchema = z.object({
  id: z.string().optional(),
  supportTicketId: z.string(),
  ticketNumber: z.string().optional(),
  message: z
    .string()
    .min(1, { message: reqError("Message") })
    .max(500, { message: maxLenError("Message", 500) }),
  userId: z.string(),
  userFullName: z.string().optional(),
  userName: z.string().optional(),
  avatarSrc: z.string().optional(),
  initials: z.string().optional(),
  isEdited: z.boolean().optional(),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

export const subjectSchema = z
  .string()
  .min(1, { message: reqError("Subject") })
  .max(255, { message: maxLenError("Subject", 255) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Subject"),
  });

/**
 * Represents the Zod schema for a support ticket.
 */
export const supportTicketZodSchema = z.object({
  id: z.string().optional(),
  ticketNumber: z.string().optional(),
  subject: subjectSchema,
  description: z
    .string()
    .min(1, { message: reqError("Description") })
    .min(100, { message: reqError("Description of minimum 100 characters") })
    .max(500, { message: maxLenError("Description", 500) }),
  priority: z.string().optional(),
  status: z.string().optional(),
  remarkCount: z.number().optional(),
  supportTicketRemarks: supportTicketRemarksZodSchema.array().optional(),
  isDisabled: z.boolean(),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

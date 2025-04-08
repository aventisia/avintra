import {
  emailError,
  maxLenError,
  nameError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { nameRegex } from "@/react-toolkit/utils/regex-list";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a email.
 */
export const userEmailSchema = z
  .string()
  .min(1, { message: reqError("Email") })
  .max(254, { message: maxLenError("Email", 254) })
  .email({ message: emailError() });

/**
 * Represents the Zod schema for a user.
 */
export const userZodSchema = z.object({
  id: z.string(),
  firstName: z
    .string()
    .min(1, { message: reqError("First Name") })
    .max(50, { message: maxLenError("First Name", 50) })
    .regex(nameRegex, {
      message: nameError("First Name"),
    }),
  lastName: z
    .string()
    .min(1, { message: reqError("Last Name") })
    .max(50, { message: maxLenError("Last Name", 50) })
    .regex(nameRegex, {
      message: nameError("Last Name"),
    }),
  email: userEmailSchema,
  userRoles: z.array(z.string()).min(1, { message: reqError("Role (s)") }),
  twoFactorEnabled: z.boolean().default(false),
  unlockAccount: z.boolean(),
  isDisabled: z.boolean(),
  // Read (view) only fields
  lockoutEnd: z.date().optional(),
  emailConfirmed: z.boolean().optional(),
  pwdSetOn: z.date().optional(),
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

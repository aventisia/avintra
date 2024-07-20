import { z } from "zod";
import {
  maxLenError,
  reqError,
  alphaNumericRegex,
  alphaNumericError,
} from "@/react-toolkit/components/form";

/**
 * Represents the Zod schema for a user.
 */
export const userZodSchema = z.object({
  id: z.string(),
  firstName: z
    .string()
    .min(1, { message: reqError("User firstName") })
    .max(100, { message: maxLenError("User firstName", 100) })
    .regex(alphaNumericRegex, {
      message: alphaNumericError("User firstName"),
    }),
  lastName: z
    .string()
    .min(1, { message: reqError("User lastName") })
    .max(100, { message: maxLenError("User lastName", 100) })
    .regex(alphaNumericRegex, {
      message: alphaNumericError("User lastName"),
    }),
  email: z.string().email(),
  twoFactorEnabled: z.boolean().default(false),
  userRoles: z.array(z.string()),
  isDisabled: z.boolean().default(false),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

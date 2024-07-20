import { z } from "zod";
import {
  maxLenError,
  reqError,
  alphaNumericRegex,
  alphaNumericError,
  noWhitespaceRegex,
  noWhitespaceError,
  variableRegex,
  variableError,
} from "@/react-toolkit/components/form";
//import { DatabaseOptionsEnum } from "@/react-toolkit/enums/database-options-enum";

/**
 * Represents the Zod schema for a tenant.
 */
export const tenantZodSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(1, { message: reqError("Tenant name") })
    .max(100, { message: maxLenError("Tenant name", 100) })
    .regex(alphaNumericRegex, {
      message: alphaNumericError("Tenant name"),
    })
    .default(""),
  expiresOn: z.date().optional(),
  isPwdEnabled: z.boolean().optional(),
  isTwoFAEnabled: z.boolean().optional(),
  isPwdNeverExpiresEnabled: z.boolean().optional(),
  daysBeforePwdExpires: z.string().optional(),
  isIdleSessionTimeoutEnabled: z.boolean().optional(),
  idleSessionTimeoutMinutes: z.string().optional(),
  isSSOEnabled: z.boolean().optional(),
  ssoConfigJson: z.string().max(1000).optional(),
  dbOption: z.string(),
  dbUserId: z
    .string()
    .max(50)
    .regex(noWhitespaceRegex, {
      message: noWhitespaceError("User Id"),
    })
    .optional(),
  dbPwd: z.string().max(50).optional(),
  dbHost: z
    .string()
    .max(500)
    .regex(noWhitespaceRegex, {
      message: noWhitespaceError("Host"),
    })
    .optional(),
  dbPort: z.string().optional(),
  dbNamePrefix: z
    .string()
    .max(50)
    .regex(variableRegex, {
      message: variableError("Database Name' Prefix"),
    })
    .optional(),
  isDisabled: z.boolean().optional(),
  // Read (view) only fields
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

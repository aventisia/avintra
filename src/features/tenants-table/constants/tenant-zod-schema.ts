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
import { DatabaseOptionsEnum } from "@/react-toolkit/enums";

/**
 * Represents the Zod schema for a tenant.
 */
export const tenantZodSchema = z.object({
  // Single fields
  id: z.string().optional(),
  name: z
    .string()
    .min(1, { message: reqError("Tenant name") })
    .max(100, { message: maxLenError("Tenant name", 100) })
    .regex(alphaNumericRegex, {
      message: alphaNumericError("Tenant name"),
    })
    .default(""),
  expiresOn: z.date().optional().default(() => new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)),
  isTwoFAEnabled: z.boolean().optional().default(false),
  // Group
  isPwdEnabled: z.boolean().optional().default(true),
  isSSOEnabled: z.boolean().optional().default(false),
  ssoConfigJson: z.string().max(1000).optional(),
  // Group
  isPwdNeverExpiresEnabled: z.boolean().optional().default(true),
  daysBeforePwdExpires: z.string().optional().default("730"),
  // Group
  isIdleSessionTimeoutEnabled: z.boolean().optional().default(true),
  idleSessionTimeoutMinutes: z.string().optional().default("10"),
  // Group
  dbOption: z.nativeEnum(DatabaseOptionsEnum).default(DatabaseOptionsEnum.Shared),
  dbNamePrefix: z
    .string()
    .max(10)
    .regex(variableRegex, {
      message: variableError("Database Name' Prefix"),
    })
    .optional(),
  // Sub-group
  dbUserId: z
    .string()
    .max(50)
    .regex(noWhitespaceRegex, {
      message: noWhitespaceError("User Id"),
    })
    .optional(),
  dbPwd: z.string().max(50).optional(),
  // Sub-group
  dbHost: z
    .string()
    .max(500)
    .regex(noWhitespaceRegex, {
      message: noWhitespaceError("Host"),
    })
    .optional(),
  dbPort: z.string().optional(),
  // Single field
  isDisabled: z.boolean().optional(),
  // Group (read-only)
  createdBy: z.string(),
  createdOn: z.date(),
  lastModifiedBy: z.string(),
  lastModifiedOn: z.date(),
});

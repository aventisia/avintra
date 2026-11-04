import { DatabaseOptionsEnum } from "@avplatform/ui/enums/database-options-enum";
import {
  alphaNumericError,
  alphaNumericRegex,
  maxLenError,
  noWhitespaceError,
  noWhitespaceRegex,
  reqError,
  variableError,
  variableRegex,
} from "@avplatform/ui/utils";
import { z } from "zod";

/**
 * Represents the Zod object's item schema for a tenant name.
 */
export const tenantNameSchema = z
  .string()
  .min(1, { message: reqError("Tenant name") })
  .max(100, { message: maxLenError("Tenant name", 100) })
  .regex(alphaNumericRegex, {
    message: alphaNumericError("Tenant name"),
  });

/**
 * Hostname grammar accepted for a tenant email domain; matches the backend rule.
 */
export const tenantDomainRegex =
  /^[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

/**
 * Represents the Zod schema for a tenant.
 */
export const tenantZodSchema = z
  .object({
    // Single fields
    id: z.string().optional(),
    name: z
      .string()
      .min(1, { message: reqError("Tenant name") })
      .max(100, { message: maxLenError("Tenant name", 100) })
      .regex(alphaNumericRegex, {
        message: alphaNumericError("Tenant name"),
      }),
    domain: z
      .string()
      .max(100, { message: maxLenError("Domain", 100) })
      .refine((value) => value === "" || tenantDomainRegex.test(value), {
        message: "Enter a valid email domain (for example, company.com).",
      }),
    type: z
      .string({ required_error: reqError("Deployment type") })
      .min(1, { message: reqError("Deployment type") }),
    currency: z
      .string({ required_error: reqError("Currency") })
      .min(1, { message: reqError("Currency") }),
    effectiveDate: z.date(),
    renewalDate: z.date(),
    expiresOn: z.date().optional(),
    isTwoFAEnabled: z.boolean().optional(),
    isChangeRequestEnabled: z.boolean().optional(),
    // Group
    isPwdEnabled: z.boolean().optional(),
    isSSOEnabled: z.boolean().optional(),
    // Group
    isPwdNeverExpiresEnabled: z.boolean().optional(),
    daysBeforePwdExpires: z.string().optional(),
    // Group
    isIdleSessionTimeoutEnabled: z.boolean().optional(),
    idleSessionTimeoutMinutes: z.string().optional(),
    // Group
    dbOption: z.nativeEnum(DatabaseOptionsEnum),
    dbNamePrefix: z
      .string()
      .optional()
      .refine((value) => value === undefined || value.length <= 10, {
        message: maxLenError("Database Name' Prefix", 10),
      })
      .refine((value) => value === undefined || value.match(variableRegex), {
        message: variableError("Database Name' Prefix"),
      }),
    // Sub-group
    dbUserId: z
      .string()
      .optional()
      .refine((value) => value === undefined || value.length <= 50, {
        message: maxLenError("User Id", 50),
      })
      .refine((value) => value === undefined || value.match(noWhitespaceRegex), {
        message: noWhitespaceError("User Id"),
      }),
    dbPwd: z
      .string()
      .optional()
      .refine((value) => value === undefined || value.length <= 50, {
        message: maxLenError("Password", 50),
      }),
    // Sub-group
    dbHost: z
      .string()
      .optional()
      .refine((value) => value === undefined || value.length <= 500, {
        message: maxLenError("Host", 500),
      })
      .refine((value) => value === undefined || value.match(noWhitespaceRegex), {
        message: noWhitespaceError("Host"),
      }),
    dbPort: z.string().optional(),
    // Single field
    isDisabled: z.boolean(),
    // Group (read-only)
    createdBy: z.string(),
    createdOn: z.date(),
    lastModifiedBy: z.string(),
    lastModifiedOn: z.date(),
  })
  .refine((data) => !(!data.isPwdNeverExpiresEnabled && !data.daysBeforePwdExpires), {
    path: ["daysBeforePwdExpires"],
    message: reqError("Field"),
  })
  .refine((data) => !(data.isIdleSessionTimeoutEnabled && !data.idleSessionTimeoutMinutes), {
    path: ["idleSessionTimeoutMinutes"],
    message: reqError("Field"),
  });

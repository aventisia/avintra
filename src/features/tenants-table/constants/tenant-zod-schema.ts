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
    expiresOn: z.date().optional(),
    isTwoFAEnabled: z.boolean().optional(),
    // Group
    isPwdEnabled: z.boolean().optional(),
    isSSOEnabled: z.boolean().optional(),
    ssoConfigJson: z
      .string()
      .optional()
      .refine((value) => value === undefined || value.length <= 500, {
        message: maxLenError("Field", 1000),
      }),
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
      .refine(
        (value) => value === undefined || value.match(noWhitespaceRegex),
        {
          message: noWhitespaceError("User Id"),
        },
      ),
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
      .refine(
        (value) => value === undefined || value.match(noWhitespaceRegex),
        {
          message: noWhitespaceError("Host"),
        },
      ),
    dbPort: z.string().optional(),
    // Single field
    isDisabled: z.boolean(),
    // Group (read-only)
    createdBy: z.string(),
    createdOn: z.date(),
    lastModifiedBy: z.string(),
    lastModifiedOn: z.date(),
  })
  .refine((data) => !(data.isSSOEnabled && !data.ssoConfigJson), {
    path: ["ssoConfigJson"],
    message: reqError("Field"),
  })
  .refine(
    (data) => !(!data.isPwdNeverExpiresEnabled && !data.daysBeforePwdExpires),
    {
      path: ["daysBeforePwdExpires"],
      message: reqError("Field"),
    },
  )
  .refine(
    (data) =>
      !(data.isIdleSessionTimeoutEnabled && !data.idleSessionTimeoutMinutes),
    {
      path: ["idleSessionTimeoutMinutes"],
      message: reqError("Field"),
    },
  );

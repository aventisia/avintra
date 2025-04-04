import {
  alphaNumericError,
  maxLenError,
  reqError,
} from "@/react-toolkit/utils/error-message-list";
import { alphaNumericRegex } from "@/react-toolkit/utils/regex-list";
import { z } from "zod";

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

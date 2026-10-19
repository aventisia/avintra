import { z } from "zod";

const ssoDisableWarningSchema = z.object({
  warnOnly: z.boolean(),
  affectedAdmins: z.array(z.string()),
  affectedUserCount: z.number(),
  recoveryHint: z.string().nullable(),
});

const preferencesSchema = z.object({
  id: z.string(),
  tenantName: z.string(),
  isSSOEnabled: z.boolean(),
  isPwdEnabled: z.boolean(),
  isPwdNeverExpiresEnabled: z.boolean(),
  daysBeforePwdExpires: z.number(),
  isIdleSessionTimeoutEnabled: z.boolean(),
  idleSessionTimeoutMinutes: z.number(),
  isTwoFAEnabled: z.boolean(),
  ssoConfigJson: z.string().optional(),
  ssoDisableWarning: ssoDisableWarningSchema.optional(),
});

export { preferencesSchema };

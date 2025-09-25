import { z } from "zod";

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
});

export { preferencesSchema };

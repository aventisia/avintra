import type { TenantPreferencesDto } from "../dtos/tenant-prefrences-dto.ee";

/** Builds the tenant preferences form values from a preferences response. */
export const buildPreferencesFormValues = (preferences: TenantPreferencesDto) => ({
  id: preferences.id,
  tenantName: preferences.tenantName,
  isPwdEnabled: preferences.isPwdEnabled,
  isPwdNeverExpiresEnabled: preferences.isPwdNeverExpiresEnabled,
  daysBeforePwdExpires: preferences.daysBeforePwdExpires,
  isIdleSessionTimeoutEnabled: preferences.isIdleSessionTimeoutEnabled,
  idleSessionTimeoutMinutes: preferences.idleSessionTimeoutMinutes,
  isTwoFAEnabled: preferences.isTwoFAEnabled,
});

import type { SsoDisableWarningDto } from "./sso-disable-warning-dto";

/**
 * Represents a data transfer object (DTO) for Tenant Preferences.
 */
export interface TenantPreferencesDto {  /**
   * Gets or sets the primary key of the tenant preferences record.
   */
  id: string;

  /**
   * Gets or sets the name of the tenant.
   */
  tenantName: string;

  /**
   * Gets or sets a flag indicating whether single sign-on (SSO) is enabled.
   */
  isSSOEnabled: boolean;

  /**
   * Gets or sets a flag indicating whether password-based login is enabled.
   */
  isPwdEnabled: boolean;

  /**
   * Gets or sets a flag indicating whether the password never expires.
   */
  isPwdNeverExpiresEnabled: boolean;

  /**
   * Gets or sets the number of days before the password expires.
   */
  daysBeforePwdExpires: number;

  /**
   * Gets or sets a flag indicating whether idle session timeout is enabled.
   */
  isIdleSessionTimeoutEnabled: boolean;

  /**
   * Gets or sets the number of minutes before an idle session times out.
   */
  idleSessionTimeoutMinutes: number;

  /**
   * Gets or sets a flag indicating whether two-factor authentication (2FA) is enabled.
   */
  isTwoFAEnabled: boolean;

  /**
   * Gets or sets the versioned single sign-on configuration document.
   */
  ssoConfigJson?: string;

  /**
   * Gets or sets the non-blocking warning produced when single sign-on is disabled with passwordless users present.
   */
  ssoDisableWarning?: SsoDisableWarningDto;
}

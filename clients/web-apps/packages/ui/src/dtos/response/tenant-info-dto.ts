/** To receive tenant's info required for authentication */
interface TenantInfoDto {
  /** Tenant's primary id (Guid) */
  tenantId: string;

  /** Tenant's full name */
  name: string;

  /** Username of user who is requesting the info for auth */
  userName: string;

  /** Tenant's single sign-on config if there are any */
  ssoConfigJson: string;

  /** Social provider a passwordless account signs in with, when it has one */
  socialLoginProvider: string | null;
}

export { type TenantInfoDto };

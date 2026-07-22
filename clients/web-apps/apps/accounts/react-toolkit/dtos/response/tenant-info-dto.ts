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
}

export { type TenantInfoDto };

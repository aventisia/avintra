/** To receive user session object on sucussful login or refresh token*/
interface UserSessionDto {
  /** Tenant's full name */
  tenantName: string;

  /** User's first name */
  firstName: string;

  /** User's last name */
  lastName: string;

  /** 2 char long user name's initials */
  userInitials: string;

  /**
   * JWT to only extract user data from.
   * Also, to send it in Authorization Header as Bearer if client does not support cookies
   */
  accessToken: string;

  /** Token to get new JWT */
  refreshToken: string;

  /** A date when refresh token gets expires */
  rtExpiresOn: Date;

  country: string;

  /** Tenant type: "Unspecified" until organization setup, or "NA" without a tenant */
  tenantType: string;

  platformVersion: string;

  /** Whether the tenant's active subscription is a paid (priced) plan */
  hasPaidPlan?: boolean;
}

export { type UserSessionDto };

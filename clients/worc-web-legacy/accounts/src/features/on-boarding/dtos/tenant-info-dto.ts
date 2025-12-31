/** Tenant info dto */
interface TenantInfoDto {
  /** Organization name */
  organizationName: string;

  /** User's first name. Max-50 */
  domain: string;

  /** User's last name. Max-50 */
  numberOfEmployees?: string;

  /** Password for the user account. Min-8, Max-16 */
  industry?: string;

  /** Primary key of verificaiton code db record */
  country?: string;

  /** The verification code or OTP provided by user */
  role?: string;

  type: "Individual" | "Organization" | "Unspecified";
}

export { type TenantInfoDto };

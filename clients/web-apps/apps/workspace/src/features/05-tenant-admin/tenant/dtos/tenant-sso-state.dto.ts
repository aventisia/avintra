/** Represents a single sign-on enable/disable request for a tenant. */
export interface TenantSsoStateDto {
  /** Gets or sets a value indicating whether single sign-on should be enabled. */
  isSSOEnabled: boolean;
}

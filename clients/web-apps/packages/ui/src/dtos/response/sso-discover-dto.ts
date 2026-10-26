/** Home-realm-discovery result for an email address */
interface SsoDiscoverDto {
  /** Provider authorization URL carrying the email hint, state and nonce; null when no single sign-on tenant matches */
  ssoLoginUrl: string | null;

  /** Identity provider key when a single sign-on tenant matches */
  provider: string | null;

  /** Matching tenant id when a single sign-on tenant matches */
  tenantId: string | null;
}

export { type SsoDiscoverDto };

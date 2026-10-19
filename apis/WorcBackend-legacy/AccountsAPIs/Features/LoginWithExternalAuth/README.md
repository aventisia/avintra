# Login with external auth (Microsoft Entra ID)

Single sign-on for `Organization` tenants using Microsoft Entra ID. Google, Facebook and Twitter stay
unimplemented on purpose.

## Flow

1. A user types their email on the login screen.
2. The app asks `POST /auth/discover`. When the email domain belongs to an `Organization` tenant with SSO
   enabled, the answer is an Entra authorize URL containing `login_hint`, `state` and `nonce`. Otherwise the
   answer is empty and the user continues with a password.
3. Entra sends the user back to `https://{AppBaseUrl}/accounts/sso-redirect` with `code` and `state`.
4. The app calls `GET /auth/entra/token?code=...&state=...`. AccountsAPIs verifies the `id_token`, signs the
   user in (creating them when they are new) and sets the normal session cookies.

`POST /auth/tenant-info` behaves exactly as before and is kept for existing clients.

## Invariants

- **Every sign-in is verified.** The `id_token` is validated against Microsoft's JWKS (RS256 only), its
  audience, and its lifetime. No code path accepts an unverified token.
- **`tid` binds the tenant.** The token's `tid` must equal the `externalTenantId` stored for the tenant, and
  the issuer must be `https://login.microsoftonline.com/{tid}/v2.0`. The Microsoft consumer tenant
  `9188040d-6c67-4c5b-b112-36a304b66dad` is always rejected, as are public mail domains.
- **`state` is single use.** It is created with the authorize URL, lives 10 minutes in memory, and is removed
  the moment the callback consumes it. A missing, replayed or tampered state is rejected with `400`.
- **Home realm discovery needs no user.** Discovery works on the email domain alone, so it also works before a
  user is provisioned. Consumer mail domains never match a tenant.
- **Where the data lives.** `Tenants.SSOConfigJson` holds a versioned JSON document (version 1,
  provider `microsoft_entra`). `Tenants.Domain` is the matching key. No new table or column is involved, so no
  migration is needed. Documents with an unknown version or another provider are ignored, which means such a
  tenant simply counts as "SSO off".
- **Tenant secrets never leave the server.** A tenant can supply its own app registration (client id and
  secret). The secret is stored protected with ASP.NET DataProtection and is never returned by any GET. The
  tenant admin preferences endpoint answers with a redacted document plus `ssoSecretPresent`, and the Super
  Admin tenant reads omit `SSOConfigJson` completely. Raw SSO JSON is editable nowhere in the UI.
- **Disabling SSO only warns.** Turning SSO off never blocks. When users without a password are affected, the
  response carries a warning that names the affected admins and explains how they set a password, an
  `SSO_DISABLED_WARN_ONLY` audit entry is written, and the login screen tells those users to set a password
  instead of showing "Invalid credentials". The admin can therefore still lock users out - that is a deliberate,
  accepted trade-off, so the warning and the audit entry are mandatory.
- **Break glass.** Password login keeps working for users who have a password, whether SSO is on or off, and
  the login screen offers a password escape next to the provider redirect. There is no enable-time password
  requirement.
- **Domain ownership is attested, not proven.** A tenant admin ticks a confirmation box, which is stored as
  `domainVerified` with a timestamp and the attesting user. Automated DNS verification is not implemented yet.
- **Only tenant admins may connect or toggle.** `PUT tenant-account/preferences` and the consent endpoints are
  gated by the `TA` role on the server.

## Operator notes

- **Data protection keys are deployment state.** Point `DATA_PROTECTION_KEYS_DIR` at a durable path that
  survives redeploys, mount it for every deployment and back it up. Without it the keys sit under the binary
  directory and are lost on the next redeploy.
- Losing the keys orphans already staged tenant secrets: enabling SSO then fails with "A client secret is
  required for tenant-supplied credentials.", and the tenant admin saves the secret again.
- Rotating a tenant secret is done by saving the new secret in the tenant admin preferences.

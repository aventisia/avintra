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
  provider `microsoft_entra`) with four members: `v`, `provider`, `externalTenantId` and `emailDomain`.
  `Tenants.Domain` is the matching key. No new table or column is involved, so no migration is needed.
  Documents with an unknown version or another provider are ignored, which means such a tenant simply
  counts as "SSO off".
- **Credentials are platform-level.** Sign-in, consent and token exchange always use the deployment app
  configured through `MICROSOFT_SSO_CLIENT_ID` / `MICROSOFT_SSO_CLIENT_SECRET`, and the enable gate validates
  those same keys live. `MICROSOFT_SSO_ENABLED` is the single gate for this flow, and Community deployments
  never offer it. Community is a self-hosted open-source copy: `MICROSOFT_SSO_*` and `BRANDING_*` env values
  are ignored at startup and only a valid GlobalAdmin tenant/instance with `SsoAllowed` may offer
  single sign-on. Branding is served only when GlobalAdmin returns `BrandingAllowed=true`; an omitted flag
  denies it. `GOOGLE_SSO_CLIENT_ID` / `GOOGLE_SSO_CLIENT_SECRET` are loaded for future providers and are
  not used yet. No tenant supplies or
  stores client credentials, there is no secret field in the stored document, and no response returns
  credential material. Super Admin tenant reads omit `SSOConfigJson` completely; raw SSO JSON is editable
  nowhere in the UI. `AZURE_TENANT_ID`, `AZURE_ENTRA_ID_CLIENT_ID` and `AZURE_ENTRA_ID_CLIENT_SECRET` remain
  loaded only for the legacy credential-validation path, and `AZURE_ENTRA_ID_ENABLED` is still loaded but no
  longer gates anything; dropping them is future work.
- **Disabling SSO only warns.** Turning SSO off never blocks. When users without a password are affected, the
  response carries a warning that names the affected admins and explains how they set a password, an
  `SSO_DISABLED_WARN_ONLY` audit entry is written, and the login screen tells those users to set a password
  instead of showing "Invalid credentials". The admin can therefore still lock users out - that is a deliberate,
  accepted trade-off, so the warning and the audit entry are mandatory.
- **Break glass.** Password login keeps working for users who have a password, whether SSO is on or off. The
  login screen does not offer a password escape from the single sign-on redirect. There is no enable-time
  password requirement.
- **Connect binds the identity provider.** The domain comes only from the tenant record (`Tenant.Domain`).
  Completing the admin-consent grant binds the granted Entra `tid` to the tenant's stored `externalTenantId`
  and refreshes the stored `emailDomain` from the tenant record. There is no verification flag and no DNS
  check yet. Enabling SSO requires that connection: without a bound `externalTenantId` the server answers
  `Connect the identity provider before enabling single sign-on.`
- **Only tenant admins may connect or toggle.** `PUT tenant-account/preferences`,
  `PUT tenant-account/sso/enabled` and the consent endpoints are gated by the `TA` role on the server.
- **Connect uses the admin-consent endpoint.** The tenant admin Connect button opens
  `…/organizations/v2.0/adminconsent` with `client_id`, `redirect_uri`, `state` and `scope`; the client id is
  the platform `MICROSOFT_SSO_CLIENT_ID` and the ordinary login URL is unchanged.

## Operator notes

- No tenant credential is stored, so there is no key material or tenant secret to persist, rotate or back up.
  The DataProtection key directory used only for tenant secrets was removed together with the BYO path.

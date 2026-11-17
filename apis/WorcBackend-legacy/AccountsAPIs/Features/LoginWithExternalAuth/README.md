# Login with external auth (Microsoft Entra ID, Google, GitHub)

Two flows live here: single sign-on for `Organization` tenants using Microsoft Entra ID, and
"Continue with Google" / "Continue with GitHub" for every other account. Facebook and Twitter stay
unimplemented on purpose.

## Entra flow

1. A user types their email on the login screen.
2. The app asks `POST /auth/discover`. When the email domain belongs to an `Organization` tenant that is
   offered single sign-on (see Invariants), the answer is an Entra authorize URL containing `login_hint`,
   `state` and `nonce`. Otherwise the answer is empty and the user continues with a password.
3. Entra sends the user back to `https://{AppBaseUrl}/accounts/sso-redirect` with `code` and `state`.
4. The app calls `GET /auth/entra/token?code=...&state=...`. AccountsAPIs verifies the `id_token`, signs the
   user in (creating them when they are new) and sets the normal session cookies.

`POST /auth/tenant-info` is kept for existing clients. It returns an Entra URL only when the deployment
allows single sign-on, the tenant switch is on and the connection is bound, and `null` otherwise.

## Social flow (Google, GitHub)

1. The login and sign-up screens always show both "Continue with Google" and
   "Continue with GitHub" buttons.
2. Clicking a button asks `GET /auth/social/login-url?provider=...&redirect=...&hasPlanIntent=...`. The
   answer is the provider's authorize URL: PKCE, a single-use `state`, a nonce for Google and a
   per-attempt browser-binding cookie. The browser then leaves for the provider.
3. The provider sends the user back to `https://{AppBaseUrl}/accounts/sso-redirect` with `code` and
   `state`; the `social.` state prefix is what tells the screen this is a social callback, so no extra
   redirect URI is registered.
4. The app calls `GET /auth/social/callback?code=...&state=...`. AccountsAPIs exchanges the code on the
   server, resolves the person, and answers one of four outcomes: `SignedIn` (session cookies are set),
   `TwoFARequired`, `LinkCodeRequired` or `SsoRequired` (the tenant's single sign-on URL).
5. `POST /auth/social/link/verify` confirms the link code, and `POST /auth/social/challenge/resend`
   reissues the two-step or link code. Both refuse with the password-login message when authentication
   is off, and with a neutral message when this installation must not offer social sign-in.

Outcomes are a resolution, not a session: the account is created or linked only when the exchange
succeeded, and the session is issued in the controller after that.

### Social invariants

- **Both providers are always offered in the UI.** The buttons render unconditionally; a provider
  with a blank `GOOGLE_OAUTH_*` or `GITHUB_OAUTH_*` pair answers
  `400 Social sign-in is not configured.` from the login-url and callback endpoints.
- **The provider is verified, never trusted.** Google's `id_token` is validated against its JWKS,
  audience, lifetime, issuer and the stored nonce, and its `email_verified` flag must be true. GitHub's
  access token is exchanged server-side and only a primary, verified address from `/user/emails` is
  accepted; otherwise the answer is the "verify your email" message. No client-supplied identity is used.
- **`state` is single use and bound to the browser.** The state entry carries the provider, nonce, PKCE
  verifier, return path and paid-plan intent, lives 10 minutes in the same per-process store as Entra
  state, and is read-and-deleted when the callback consumes it. Each attempt writes its own binding
  cookie (named after its state), so a second tab starting a sign-in never breaks the first one, and the
  binding cookie value plus the user agent must hash to the stored binding. The store is per-process, so
  the same single-replica or sticky-session topology applies.
- **The return path is judged before it is stored.** A `redirect` that is not a site-relative path is
  refused with `400 The redirect URL is not allowed.` after being decoded once, so an absolute URL, a
  protocol-relative path, a backslash form or a control character never reaches the state; the accounts
  app reduces a same-origin absolute URL to its path before calling, then the same rule applies.
- **A linked provider is offered before the password.** `tenant-info` returns `socialLoginProvider`
  whenever the account has a Google/GitHub login and the deployment offers and configures it, even when
  the account also has a password; `hasPassword` tells the client to keep the password form as the
  fallback. Setting a first password is limited to linked accounts, so a single sign-on account cannot
  gain one.
- **Single sign-on wins.** When the person's domain belongs to a tenant that is offered single sign-on,
  the callback returns that tenant's Entra URL and nothing is created or linked. Community deployments
  never take that branch.
- **Existing account, provider identity unknown: link only by code.** Silent linking happens only when
  the provider owns the mailbox: a `gmail.com`/`googlemail.com` address or a Google Workspace domain
  (`hd`). Every GitHub address, and a Google account registered on an outside address, answers
  `LinkCodeRequired` instead, and the pending identity is stored in the cache for
  `OtpValidityInMinutes`, so a provider account can never quietly take over an existing mailbox. A
  provider identity already in `AspNetUserLogins` signs straight in, even after either side changes its
  email.
- **New accounts reuse the email sign-up path.** Provisioning, roles and the account-created mail come
  from `AccountProvisioningHelpers`, so a social sign-up produces the same account as an email sign-up.
  A parallel sign-up for the same address loses the race and is linked instead of duplicated.
- **Two-step verification and account blocks behave like email sign-in.** A tenant or user with 2FA gets
  the normal code screen (existing `verify-2fa-code` completes it), and a disabled, deleted or
  invalid-tenant account gets the same message a password login would get, with no session.
- **The link code is internal and capped.** Only the social callback mints a `LinkSocialLogin` code, so
  the public `POST /auth/create-code` refuses that request type with the same `403` it answers for
  `TwoFA` and `UpdatePwd`. Five rejected entries burn the challenge, and the count is carried by the
  cached challenge so a resend never grants fresh guesses. `POST /auth/verify-2fa-code` accepts only
  two-step codes, so a link code cannot be redeemed there for a session without the link, the
  "connected" mail and the audit entry. Issuing a code only replaces the outstanding codes of its own
  request type, so a social challenge never invalidates an in-flight password-reset or two-step code.
- **What is written.** A new link writes a `SOCIAL_SIGNIN_CONNECTED` audit entry, and linking an
  existing account also mails `SocialSignInConnected`. A brand-new account gets the usual
  `AccountCreated` mail instead of a second "connected" mail.

## Invariants

- **SSO is offered only when all three conditions hold.** The deployment must allow single sign-on, the
  tenant's SSO switch must be on, and the stored connection must be bound to an external tenant id for a
  non-blank tenant domain. `POST /auth/discover` and `POST /auth/tenant-info` apply that one rule before
  they build a login URL, so a tenant missing any leg goes to the password step instead of an SSO login
  that would then fail. The switch is read from the tenant row on every login attempt: a Super Admin who
  turns it off hides the offer from the next attempt, with no extra step and no wait. Community deployments
  fail the first condition, because the deployment-level allow is always off there.
- **Every sign-in is verified.** The `id_token` is validated against Microsoft's JWKS (RS256 only), its
  audience, and its lifetime. No code path accepts an unverified token.
- **`tid` binds the tenant.** The token's `tid` must equal the `externalTenantId` stored for the tenant, and
  the issuer must be `https://login.microsoftonline.com/{tid}/v2.0`. The Microsoft consumer tenant
  `9188040d-6c67-4c5b-b112-36a304b66dad` is always rejected, as are public mail domains.
- **`state` is single use.** It is created with the authorize URL, lives 10 minutes in the AccountsAPIs
  process's memory, and is read-and-deleted atomically when the callback consumes it, so two concurrent
  callbacks cannot both pass. The store is per-process, not shared: the supported topology is one
  AccountsAPIs replica or sticky sessions, because a callback that lands on another replica is rejected as
  unknown state. A missing, replayed or tampered state is rejected with `400`.
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
  not used yet; social sign-in uses its own `GOOGLE_OAUTH_*` / `GITHUB_OAUTH_*` pair (see Social
  invariants). No tenant supplies or
  stores client credentials, there is no secret field in the stored document, and no response returns
  credential material. Super Admin tenant reads return `SSOConfigJson` as `null`; raw SSO JSON is editable
  nowhere in the UI. The old `tenant-sso` / `siw-*` sign-in stubs and the legacy Azure Entra settings are
  gone, so this is the only single sign-on implementation.
- **Disabling SSO only warns.** Turning SSO off never blocks, even when SSO availability is revoked for the
  deployment; only turning it on is gated. When users without a password are affected, the
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

- Social sign-in is configured per provider with `GOOGLE_OAUTH_CLIENT_ID` /
  `GOOGLE_OAUTH_CLIENT_SECRET` and `GITHUB_OAUTH_CLIENT_ID` /
  `GITHUB_OAUTH_CLIENT_SECRET` (see `AccountsAPIs/.env.example`). Set only the
  pair whose button should work; an unset pair answers
  `400 Social sign-in is not configured.` from the login-url and callback
  endpoints, and with both unset the flow is off. The buttons render regardless;
  the backend is the gate.
- On Enterprise on-prem installs social sign-in is refused: the login-url,
  callback, link and resend endpoints answer `400`, so the company-domain
  emailed-code signup rule is unchanged. The desktop app hides the buttons.
- The binding cookie is `Secure` with `SameSite=None`, so the accounts app must
  be served over HTTPS, otherwise every callback fails binding validation.
- No tenant credential is stored, so there is no key material or tenant secret to persist, rotate or back up.
  The DataProtection key directory used only for tenant secrets was removed together with the BYO path.

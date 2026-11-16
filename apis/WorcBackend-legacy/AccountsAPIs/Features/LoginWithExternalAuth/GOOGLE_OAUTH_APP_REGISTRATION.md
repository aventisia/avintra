# Register the Google OAuth App for Social Sign-In

Follow these steps once per deployment to turn on **Continue with Google** on the login and
create-account screens. Users sign in with the Google Account they already have; no customer creates a
Google Cloud project and no per-tenant configuration exists.

Scope: cloud and `Community` self-hosted deployments. `Enterprise` on-prem never offers social sign-in
(its company-domain signup rule needs the emailed code to prove mailbox control), so skip this guide
there. The desktop app also never shows the buttons, because Google blocks OAuth inside embedded
webviews. GitHub has its own [OAuth app guide](GITHUB_OAUTH_APP_REGISTRATION.md); this guide covers
Google only.

### Step 1: Create the Google Cloud project

1. Sign in to the [Google Cloud Console](https://console.cloud.google.com/) with the provider's Google
   Workspace account.
2. Open the project selector and click **New project**. Name it per environment, for example
   `avintra-social-prod` and `avintra-social-uat`. If the **Organization** field appears, select the
   provider's organization instead of **No organization**: an org-owned project survives staff changes,
   follows org policies, and is the right owner for Search Console domain verification. One project per
   environment is Google's own recommendation, because publishing status and verification apply per
   project.
3. No API needs enabling. The platform only reads the OpenID Connect `id_token`; it never calls Gmail,
   Drive, Calendar, or any other Google API.

### Step 2: Configure Google Auth Platform

1. Go to **Google Auth Platform**. If it is not configured yet, click **Get started**; otherwise open
   **Branding**, **Audience**, and **Data Access** directly.
2. Fill in **App information**:
   - **App name:** `Avintra` for production, `Avintra UAT` for UAT. This is what users see, so make the
     environment obvious.
   - **User support email:** a monitored support address.
3. Set **Audience** to **External**. Do not choose **Internal**: Internal restricts sign-in to the
   provider's own Workspace and every customer would get `org_internal`.
4. Enter a monitored **Contact information** address. Google sends policy and verification mail here.
5. Accept the Google API Services User Data Policy and click **Create**.
6. Open **Branding** and fill in the consent-screen details:
   - Logo, application home page, privacy policy, and terms of service. An External app needs a public
     privacy policy that describes the Google data it uses.
   - **Authorized domains:** add the top private domain of `APP_BASE_URL` (for example
     `aventisia.com`). Brand verification checks ownership of this domain in Google Search Console.
7. Open **Data Access** > **Add or remove scopes** and add exactly:
   - `openid`
   - `email`
   - `profile`

   All three are non-sensitive, so Google requires no data-access review or security assessment. Do not
   add Gmail, Drive, Calendar, or any sensitive or restricted scope; the platform never uses them, and
   each one adds a verification review.
8. Open **Audience** and click **Publish app** so the publishing status is **In production**. While the
   app is **Testing**, only the 100 listed test users can sign in, they see a tester warning, and their
   authorizations expire after seven days. Testing is fine for UAT with named testers (add them under
   **Audience** > **Test users** > **Add users**); production must be published before launch.
9. Optional but recommended: on **Branding**, click **Verify branding**. Domain ownership in Search
   Console must already be in place. Automated verification usually takes minutes, with manual review
   at 2-3 business days. Without it Google may not show the app name and logo on the consent screen,
   which lowers user trust; sign-in still works because the scopes are non-sensitive. Branding changes
   need re-verification, so verify before launch.

### Step 3: Create the OAuth client

1. Open **Google Auth Platform** > **Clients** and click **Create client**.
2. Set **Application type** to **Web application**.
3. Name it per environment, for example `avintra-social-prod-web`.
4. Leave **Authorized JavaScript origins** empty. The platform uses the server-side authorization-code
   flow; no Google JavaScript SDK runs in the browser.
5. Under **Authorized redirect URIs**, add exactly:

   ```text
   https://{APP_BASE_URL}/accounts/sso-redirect
   ```

   Replace `{APP_BASE_URL}` with the deployment host (for example `avintra.aventisia.com`). The value
   must match the scheme, host, and path exactly: `https`, no trailing slash, no wildcard. The local
   stack has its own `APP_BASE_URL` (for example `local-avintra.aventisia.com`), so give it its own
   client or redirect URI. This is the same callback screen Entra SSO uses; no second route exists.
6. Click **Create** and copy the **Client ID** and **Client secret**. The secret is shown only once.

### Step 4: Store the credentials in the deployment

Set these server environment variables:

```text
GOOGLE_OAUTH_CLIENT_ID=<Client ID from Step 3>
GOOGLE_OAUTH_CLIENT_SECRET=<Client secret from Step 3>
APP_BASE_URL=<host registered in Step 3, no scheme, no trailing slash>
```

- Keep the secret in the deployment's secret store or env only; never commit it. `.env.example` lists
  both keys commented out.
- Both keys must be set. A blank key hides the Google button and
  `GET auth/social/login-url?provider=Google` answers `400 Social sign-in is not configured.`
- **Do not** use `GOOGLE_SSO_CLIENT_ID` / `GOOGLE_SSO_CLIENT_SECRET`. Those keys are reserved for a
  future tenant-bound SSO provider and are unused; social sign-in reads only the `GOOGLE_OAUTH_*` pair.
- One client per environment. To rotate, add a new secret on the client, update the env, restart the
  API, verify sign-in, then disable the old secret.

### What the platform uses

- Authorize: `https://accounts.google.com/o/oauth2/v2/auth` with `openid email profile`, PKCE `S256`,
  `prompt=select_account`, a single-use `state`, and a `nonce`
  (`LoginWithExternalAuthService.Social.cs:10,649`).
- Exchange: `https://oauth2.googleapis.com/token` server-to-server with the client secret and the PKCE
  verifier (`LoginWithExternalAuthService.Social.cs:11,473`).
- Verify: the `id_token` signature against the discovery document's JWKS, plus `aud`, `exp`, `iss`, and
  the stored `nonce`; `email_verified` must be `true` (`LoginWithExternalAuthService.Social.cs:461-550`).
- Identity: `sub` is stored as the provider key in `AspNetUserLogins`, so a later Gmail address change
  does not break sign-in; `name` supplies first and last name; `hd` marks a Google Workspace mailbox,
  which links an existing account silently instead of asking for a confirmation code.
- Redirect: `https://{APP_BASE_URL}/accounts/sso-redirect`
  (`LoginWithExternalAuthService.Social.cs:682`).
- No Google API is called, no offline access is requested, and no token is stored after the callback.

### Step 5: Verify the registration

1. Open `https://{APP_BASE_URL}/accounts/login` and the create-account screen. The **Google** button
   appears above the email form, separated by `or continue with email`.
2. Click it, pick a Google Account, and consent. Expect the browser to return through
   `/accounts/sso-redirect` and land in the workspace. A new person gets the same free-plan workspace
   and welcome email as an email signup; a returning Google user goes straight in; an existing account
   on a `gmail.com` / `googlemail.com` / Google Workspace address is linked silently; an existing
   account on any other address first receives a one-time code by email.
3. Cancel on Google's consent screen. Expect a return to the login screen with the neutral
   `Sign-in was cancelled.` message, and nothing created.
4. Remove one of the two env keys, restart the API, and click the **Google** button. Expect the
   `Social sign-in is not configured.` error.

### Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `Error 400: redirect_uri_mismatch` | The registered URI differs from `https://{APP_BASE_URL}/accounts/sso-redirect` in scheme, host, path, or trailing slash. Make the client's authorized redirect URI and the deployment's `APP_BASE_URL` match exactly. |
| `Error 401: invalid_client` or "The OAuth client was not found" | Wrong `GOOGLE_OAUTH_CLIENT_ID`, or the client belongs to another project or environment. |
| `Access blocked: ... has not completed the Google verification process` / `403 access_denied` | The app is still **Testing** and the person is not a test user, or it is published but unverified with a sensitive scope. Publish to **In production** and keep scopes to `openid email profile`. |
| `org_internal` | The audience is **Internal**. Change it to **External**. |
| `admin_policy_enforced` or a Workspace user cannot consent | The user's Google Workspace admin blocks third-party apps or has not allowlisted this client. That is the customer's policy; the platform cannot override it. |
| Google button missing and `data.google` is `false` | One key is blank, `ON_PREM_LOGIN_DISABLED` is set, the deployment is an Enterprise tenant, or the desktop app is in use. |
| Consent screen shows the domain instead of the app name | Brand verification is not complete. Sign-in works, but complete Step 2.9 to show the name and logo. |
| `disallowed_useragent` | Google blocks OAuth in embedded webviews. That is why the desktop app hides the buttons. |

---

**IMPORTANT NOTE:** Single sign-on wins. If the person's email domain belongs to an organization that
uses Entra SSO, the callback sends them to that organization's SSO and creates or links nothing. Gmail
and other public mail domains never belong to an SSO organization, so those users are unaffected.

**IMPORTANT NOTE:** Keep the app published (In production) before launch. A Testing app silently
rejects every Google user who is not on the test-user list, and test-user authorizations expire after
seven days.

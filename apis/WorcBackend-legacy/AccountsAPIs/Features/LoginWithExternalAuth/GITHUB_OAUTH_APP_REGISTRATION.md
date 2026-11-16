# Register the GitHub OAuth App for Social Sign-In

Follow these steps once per deployment to turn on **Continue with GitHub** on the login and
create-account screens. Users sign in with the GitHub account they already have; no customer creates a
GitHub app and no per-tenant configuration exists.

Scope: cloud and `Community` self-hosted deployments. `Enterprise` on-prem never offers social sign-in
(its company-domain signup rule needs the emailed code to prove mailbox control), so skip this guide
there. The desktop app also never shows the buttons, because the provider round trip cannot finish in
the Tauri webview. Google has its own [OAuth app guide](GOOGLE_OAUTH_APP_REGISTRATION.md); this guide
covers GitHub only.

Register an **OAuth App**, not a GitHub App. The platform uses the OAuth web application flow with
`GET /user` and `GET /user/emails`; a GitHub App uses a different registration and permission model.

### Step 1: Choose the owning account

1. Sign in to GitHub with an account that can own the app.
2. Prefer the provider's **organization**: open the organization's page, then **Settings** >
   **Developer settings** > **OAuth apps** > **New OAuth App**. You need administrative access to the
   organization. An organization-owned app survives staff changes and stays under company control.
3. If you must use a personal account: profile picture > **Settings** > **Developer settings** >
   **OAuth apps** > **New OAuth App**. The button reads **Register a new application** when the account
   has no app yet.

GitHub has no testing or publish step: a registered app is usable immediately by any GitHub user who
authorizes it. What limits exposure is which deployment holds its client secret, so use a separate app
per environment.

### Step 2: Register the OAuth app

1. Fill in **Application name**, for example `Avintra` for production and `Avintra UAT` for UAT. This
   name is shown on the authorization page.
2. Set **Homepage URL** to the deployment's public URL, for example `https://avintra.aventisia.com`.
3. Optionally add an **Application description**. It is shown to users on the authorization page.
4. Set **Authorization callback URL** to exactly:

   ```text
   https://{APP_BASE_URL}/accounts/sso-redirect
   ```

   Replace `{APP_BASE_URL}` with the deployment host. The value must match the scheme, host, and path
   exactly: `https`, no trailing slash. This is the same callback screen Entra SSO and Google use; no
   second route exists. The local stack has its own `APP_BASE_URL` (for example
   `local-avintra.aventisia.com`), so give it its own app or callback URL.
5. GitHub allows up to 10 callback URLs per app (use **Add callback URL**). You can list production,
   UAT, and local in one app, but each deployment should still have its own app so a UAT secret never
   unlocks production.
6. Leave **wildcard matching** off for each callback URL. The platform sends the exact callback above,
   and wildcard matching would let an attacker redirect codes to any subdomain or subdirectory of it.
7. Leave **Enable Device Flow** unchecked. The platform uses the browser flow; device flow exists for
   CLIs and adds a phishing surface.
8. Leave **Expire user access tokens** at its default. The platform exchanges the code and reads the
   profile immediately, then discards the token, so token lifetime has no effect.
9. Click **Register application**.
10. Copy the **Client ID**. Under **Client secrets**, click **Generate a new client secret** and copy the
    secret immediately; GitHub shows it once.

### Step 3: Store the credentials in the deployment

Set these server environment variables:

```text
GITHUB_OAUTH_CLIENT_ID=<Client ID from Step 2>
GITHUB_OAUTH_CLIENT_SECRET=<Client secret from Step 2>
APP_BASE_URL=<host registered in Step 2, no scheme, no trailing slash>
```

- Keep the secret in the deployment's secret store or env only; never commit it. `.env.example` lists
  both keys commented out.
- Both keys must be set. A blank key hides the GitHub button and
  `GET auth/social/login-url?provider=GitHub` answers `400 Social sign-in is not configured.`
- One app per environment. To rotate, generate a new secret, update the env, restart the API, verify
  sign-in, then delete the old secret.
- The app requests no scopes at registration; scopes come from the authorize URL in Step 4. Only
  `user:email` is requested.

### What the platform uses

- Authorize: `https://github.com/login/oauth/authorize` with `scope=user:email`, a single-use `state`,
  and PKCE `S256` (`LoginWithExternalAuthService.Social.cs:14,667`).
- Exchange: `https://github.com/login/oauth/access_token` server-to-server with the client secret and
  the PKCE verifier, requesting JSON (`LoginWithExternalAuthService.Social.cs:15,560`).
- Identity: `GET https://api.github.com/user` gives the numeric `id`, which is stored as the provider key
  in `AspNetUserLogins`, so a later username or email change does not break sign-in; `name` supplies
  first and last name. `GET https://api.github.com/user/emails` must return an address that is both
  `primary` and `verified`, otherwise the sign-in is refused
  (`LoginWithExternalAuthService.Social.cs:589-616`).
- Redirect: `https://{APP_BASE_URL}/accounts/sso-redirect`
  (`LoginWithExternalAuthService.Social.cs:682`).
- No repository, organization, or gist scope is requested, and the access token is discarded after the
  callback. Do not add `read:user`, `repo`, `org`, or `gist`: `user:email` is enough for this flow.
- The platform does not send `prompt=select_account`. GitHub shows the account picker when several
  GitHub accounts are signed in; otherwise a signed-in account can go straight to the consent or
  authorization page. Use a private window to test another account.

### Step 4: Verify the registration

1. Open `https://{APP_BASE_URL}/accounts/login` and the create-account screen. The **Github** button
   appears above the email form, separated by `or continue with email`.
2. Click it and authorize. Expect the browser to return through `/accounts/sso-redirect` and land in the
   workspace. A new person gets the same free-plan workspace and welcome email as an email signup; a
   returning GitHub user goes straight in; an existing email account with the same verified email is
   linked only after a one-time code sent to that email (GitHub never links silently).
3. Cancel on GitHub's authorization page. Expect a return to the login screen with the neutral
   `Sign-in was cancelled.` message, and nothing created.
4. Sign in with a GitHub account whose primary email is unverified. Expect
   `Verify your primary email address on GitHub, or sign up with email.` and no account created.
5. Remove one of the two env keys, restart the API, and click the **Github** button. Expect the
   `Social sign-in is not configured.` error.

### Troubleshooting

| Symptom | Cause and fix |
|---|---|
| `error=redirect_uri_mismatch` / "The redirect_uri MUST match the registered callback URL" | The registered callback differs from `https://{APP_BASE_URL}/accounts/sso-redirect` in scheme, host, path, or trailing slash. Make the app's callback and the deployment's `APP_BASE_URL` match exactly. |
| `incorrect_client_credentials` or "The client_id and/or client_secret passed are incorrect" | Wrong `GITHUB_OAUTH_CLIENT_ID` or `GITHUB_OAUTH_CLIENT_SECRET`, the secret was rotated, or the app was deleted. Update the env and restart. |
| `error=bad_verification_code` | The authorization code expired (10 minutes) or was already used. Start the sign-in again. |
| "You must verify your email address before you can authorize an OAuth app" | GitHub blocks the user before the callback. The person verifies their email on GitHub, then retries. |
| `Verify your primary email address on GitHub, or sign up with email.` | GitHub returned no primary **and** verified address. The person verifies the primary email on GitHub, then retries. |
| "This account is flagged, and therefore cannot authorize a third party application" | GitHub has restricted the account. It must go through GitHub's appeal process; retrying will not help. |
| `error=application_suspended` | GitHub suspended the app for abuse or policy reasons. Contact GitHub Support; the platform cannot override it. |
| GitHub button missing and `data.gitHub` is `false` | One key is blank, `ON_PREM_LOGIN_DISABLED` is set, the deployment is an Enterprise tenant, or the desktop app is in use. |
| Authorization page still shows an old app name | The app was not saved with **Update application**, or the browser cached the page. Save and retry in a private window. |

---

**IMPORTANT NOTE:** Single sign-on wins. If the person's email domain belongs to an organization that
uses Entra SSO, the callback sends them to that organization's SSO and creates or links nothing. Public
mail domains never belong to an SSO organization, so those users are unaffected.

**IMPORTANT NOTE:** GitHub emails never link silently. Even when the address already belongs to an
account, the first GitHub sign-in sends a one-time code to that mailbox; only after the code is
confirmed is the provider stored in `AspNetUserLogins`. This prevents a GitHub account with a
look-alike address from taking over an existing account.

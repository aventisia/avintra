# Auth

Sign-in, sign-up and password reset as one flow. `/login`, `/create-account` and `/reset-pwd` all
render `AuthMain` with a different `intent`; the steps and the store are shared.

## Steps

`useAuthStore` holds the current step, the email, and any open code challenge. It lives outside the
routes on purpose, so the social callback screen can hand a code challenge to `/login`.

| Step           | Shows                                                                                                                                                                        |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `start`        | Google and GitHub first, then "Continue with email". The email form opens on its own in the desktop app, after "change email", or when email was this browser's last method. |
| `password`     | An existing account's password. "Forgot password?" emails a reset code in place.                                                                                             |
| `create`       | A new email's password, with the rules ticked off as they are met.                                                                                                           |
| `code`         | Every emailed code: sign-up, password reset, two-step, and linking a provider to an existing account.                                                                        |
| `new-password` | The new password after a verified reset code.                                                                                                                                |
| `social-only`  | An account without a password whose provider redirect could not start.                                                                                                       |

Continuing with an email asks the backend what it belongs to (`useDiscoverAccountMutation`): single
sign-on and provider-only accounts redirect straight away, an existing account goes to `password`, and
an unknown email goes to `create`. Sign-in and sign-up therefore reach the same screens; the route only
changes the start copy and the story panel.

A rejected password or code stays on its step with the reason under the field.

## Social sign-in

The provider buttons are hidden in the desktop app, where the provider round trip cannot finish in the
Tauri webview. The button this browser last signed in with carries a "Last used" tag.

The provider returns to `/accounts/sso-redirect`, whose `state` starts with `social.`. `SsoRedirectMain`
calls `GET auth/social/callback` and `useCompleteSocialSignIn` routes the answer:

- `SignedIn`: the session is stored and the browser goes to onboarding when the session reports a
  pending tenant setup or no active subscription, or when a paid plan was chosen; otherwise to the
  same-origin page it started from, or the default app.
- `TwoFARequired` and `LinkCodeRequired`: the `code` step on `/login`; a verified code lands like
  `SignedIn`.
- `SsoRequired`: the browser goes to the tenant's single sign-on URL.

A failure shows the backend's own message. A provider `error` is always reported as the neutral
`Sign-in was cancelled.`, so no provider text reaches the page.

## Redirects

Password, two-step and existing-session sign-ins honour a `redirect` query parameter only when it
points at this origin (`resolvePostLoginDestination`); anything else goes to the default app.

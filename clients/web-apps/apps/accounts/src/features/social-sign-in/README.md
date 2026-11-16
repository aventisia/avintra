# Social sign-in

"Continue with Google" and "Continue with GitHub" on the login and sign-up screens.

## Where it shows

- `SocialSignInBlock` renders the buttons, the `or continue with email` separator and the line agreeing to
  the Terms of Service and Privacy Policy. It is used by the login screen (before the email step) and the
  sign-up screen.
- The block renders nothing inside the desktop app, where the
  provider round trip cannot finish in the Tauri webview.
- `SocialOnlySignIn` is step two for an account that exists without a password: the same buttons, only
  for the provider that account is linked to.

## Callback outcomes

The provider returns to `/accounts/sso-redirect`, whose `state` starts with `social.`. `SsoRedirectMain`
then calls `GET auth/social/callback` and `useCompleteSocialSignIn` routes the answer:

- `SignedIn` — session stored locally, redirect to the return path, the onboarding flow when a paid plan
  was chosen, or the default post-login destination.
- `TwoFARequired` — the code screen with the usual resend.
- `LinkCodeRequired` — step four, where `SocialLink` asks for the code that connects the provider account
  to the existing account.
- `SsoRequired` — the browser goes to the tenant's single sign-on URL.

A failure shows the backend's own message. A provider `error` is always reported as the neutral
`Sign-in was cancelled.`, so no provider text reaches the page.

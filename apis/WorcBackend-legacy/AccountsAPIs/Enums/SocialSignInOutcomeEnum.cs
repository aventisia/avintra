namespace AccountsAPIs.Enums;

/// <summary>
/// Represents the resolved next step of a Google or GitHub sign-in attempt.
/// </summary>
public enum SocialSignInOutcomeEnum
{
    /// <summary>
    /// The provider identity belongs to exactly one account, so the session can be issued.
    /// </summary>
    SignedIn,

    /// <summary>
    /// Two-step verification is on for the account, so an emailed code must be confirmed first.
    /// </summary>
    TwoFARequired,

    /// <summary>
    /// The provider account must be confirmed with an emailed code before an existing account is linked.
    /// </summary>
    LinkCodeRequired,

    /// <summary>
    /// The email belongs to a single sign-on organization, so the person continues there.
    /// </summary>
    SsoRequired
}

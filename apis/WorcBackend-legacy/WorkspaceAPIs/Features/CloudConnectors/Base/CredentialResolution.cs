namespace WorkspaceAPIs.Features.CloudConnectors;

/// <summary>
/// Why a connector credential could not be used.
/// </summary>
public enum CredentialResolutionReason
{
    NotFound,
    Disabled,
    NoAccess,
    MissingValue,
    RejectedUpstream,
    Unavailable
}

/// <summary>
/// Outcome of resolving a stored connector credential: the credential itself, or the reason and
/// execution-log message when it cannot be used.
/// </summary>
public sealed class CredentialResolution
{
    public VaultCredentialObj? Credential { get; private init; }

    public CredentialResolutionReason? Reason { get; private init; }

    public string? FailureMessage { get; private init; }

    public bool IsSuccess => Credential is not null;

    public static CredentialResolution Succeeded(VaultCredentialObj credential) => new()
    {
        Credential = credential
    };

    public static CredentialResolution Failure(CredentialResolutionReason reason, string? credentialName, string? detail = null) => new()
    {
        Reason = reason,
        FailureMessage = ToLogMessage(reason, credentialName, detail)
    };

    /// <summary>
    /// Builds the execution-log message for a credential failure: it always names the credential (and
    /// the missing field or the redacted provider reason) and never carries a secret value.
    /// </summary>
    public static string ToLogMessage(CredentialResolutionReason reason, string? credentialName, string? detail = null) =>
        reason switch
        {
            CredentialResolutionReason.NotFound => $"Credential '{credentialName}' was not found.",
            CredentialResolutionReason.Disabled => $"Credential '{credentialName}' is disabled.",
            CredentialResolutionReason.NoAccess => $"You do not have access to credential '{credentialName}'.",
            CredentialResolutionReason.MissingValue => string.IsNullOrWhiteSpace(detail)
                ? $"Credential '{credentialName}' is missing a required value."
                : $"Credential '{credentialName}' has no '{detail}' value.",
            CredentialResolutionReason.RejectedUpstream => string.IsNullOrWhiteSpace(detail)
                ? $"The external system rejected credential '{credentialName}'."
                : $"The external system rejected credential '{credentialName}': {detail}.",
            CredentialResolutionReason.Unavailable => $"Credential '{credentialName}' could not be retrieved.",
            _ => $"Credential '{credentialName}' could not be used."
        };
}

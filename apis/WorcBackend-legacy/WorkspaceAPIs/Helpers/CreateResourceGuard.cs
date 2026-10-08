namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Validates whether a Configure resource can be created given the PROD-guard rule:
/// resources cannot be created directly while the current environment is <c>Prod</c>.
/// Published (PROD) resources are created by the flow publish flow, not by user requests.
/// Shared by all Configure services so the rule + message stay consistent.
/// </summary>
public static class CreateResourceGuard
{
    /// <summary>
    /// Returns a blocked <see cref="ServiceResponse{T}"/> when the current environment is PROD;
    /// otherwise <c>null</c> so the caller can proceed with creation.
    /// </summary>
    /// <typeparam name="T">The service response payload type of the calling method.</typeparam>
    /// <param name="envType">The environment of the incoming request.</param>
    /// <param name="resourceLabel">A user-facing label for the resource type (e.g. "credential", "queue").</param>
    /// <returns>
    /// <c>null</c> when creation is allowed; otherwise a <see cref="ServiceResponse{T}"/> indicating the block reason.
    /// </returns>
    public static ServiceResponse<T>? Validate<T>(ConfigureEnvironmentType envType, string resourceLabel)
    {
        if (envType == ConfigureEnvironmentType.Prod)
        {
            return ServiceResponse<T>.Create(
                $"Cannot create {resourceLabel} in the PROD environment. Published resources are created by publishing a flow version.",
                400);
        }

        return null;
    }
}

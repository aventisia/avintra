namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Requires the OM role when updating a resource that is persisted in the PROD environment.
/// </summary>
public static class ProdResourceUpdateGuard
{
    /// <summary>
    /// Returns a forbidden response for non-OM updates to PROD resources; otherwise returns null.
    /// </summary>
    public static ServiceResponse<T>? Validate<T>(
        ConfigureEnvironmentType envType,
        bool isOm,
        string resourceLabel)
    {
        if (envType == ConfigureEnvironmentType.Prod && !isOm)
        {
            return ServiceResponse<T>.Create(
                $"Only OM users can edit {resourceLabel} in PROD mode.",
                403);
        }

        return null;
    }
}

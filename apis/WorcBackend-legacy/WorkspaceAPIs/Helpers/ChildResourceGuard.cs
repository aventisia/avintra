namespace WorkspaceAPIs.Helpers;

/// <summary>
/// Validates whether a child resource (for example, a knowledge base file or a skill file)
/// can be added to or removed from its parent given the PROD-guard rule: a child of a
/// persisted <c>Prod</c> parent cannot be created or deleted.
/// IMPORTANT NOTE: The request environment is not sufficient on its own because it can be
/// spoofed; callers pass the parent's persisted <see cref="ConfigureEnvironmentType"/>.
/// </summary>
public static class ChildResourceGuard
{
    /// <summary>
    /// Returns a blocked response when the parent resource is PROD; otherwise <c>null</c>
    /// so the caller can proceed with the child write.
    /// </summary>
    /// <typeparam name="T">The service response payload type of the calling method.</typeparam>
    /// <param name="parentEnv">The persisted environment of the parent resource.</param>
    /// <param name="childLabel">A user-facing label for the child resource (e.g. "skill file").</param>
    public static ServiceResponse<T>? ValidateWrite<T>(ConfigureEnvironmentType parentEnv, string childLabel)
    {
        if (parentEnv == ConfigureEnvironmentType.Prod)
        {
            return ServiceResponse<T>.Create(
                $"Cannot add {childLabel} to a published (PROD) resource.",
                400);
        }

        return null;
    }

    /// <summary>
    /// Returns a blocked response when the parent resource is PROD; otherwise <c>null</c>
    /// so the caller can proceed with the child delete.
    /// </summary>
    /// <typeparam name="T">The service response payload type of the calling method.</typeparam>
    /// <param name="parentEnv">The persisted environment of the parent resource.</param>
    /// <param name="childLabel">A user-facing label for the child resource (e.g. "skill file").</param>
    public static ServiceResponse<T>? ValidateDelete<T>(ConfigureEnvironmentType parentEnv, string childLabel)
    {
        if (parentEnv == ConfigureEnvironmentType.Prod)
        {
            return ServiceResponse<T>.Create(
                $"Cannot delete {childLabel} from a published (PROD) resource.",
                400);
        }

        return null;
    }
}

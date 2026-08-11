namespace WorkspaceAPIs.Services;

/// <summary>
/// Resolves notification recipient user IDs by role, using the read-only
/// AccountsDb projections. Shared by manual notification creation and the
/// automatic notification event service to avoid duplicate logic.
/// </summary>
public interface INotificationRecipientResolver
{
    /// <summary>
    /// Resolves the user IDs that hold any of the given role names.
    /// </summary>
    /// <param name="roleNames">The role names (FullName) to match.</param>
    /// <param name="tenantId">
    /// When provided, only users of that tenant are returned. When null, only
    /// global (tenant-less) users are returned (e.g. Super Admin).
    /// </param>
    Task<List<Guid>> ResolveUserIdsByRoleNamesAsync(List<string> roleNames, Guid? tenantId);

    /// <summary>
    /// Resolves the user IDs that hold the given role name.
    /// </summary>
    /// <param name="role">The role code, e.g. "SA", "TA", "OM".</param>
    /// <param name="tenantId">
    /// When provided, only users of that tenant are returned. When null, only
    /// global (tenant-less) users are returned (e.g. Super Admin).
    /// </param>
    Task<List<Guid>> ResolveUserIdsByRoleNameAsync(string role, Guid? tenantId);
}

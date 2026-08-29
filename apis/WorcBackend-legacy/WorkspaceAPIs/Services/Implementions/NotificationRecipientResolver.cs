using AspNetToolkit.Data;

namespace WorkspaceAPIs.Services;

/// <summary>
/// Implementation of <see cref="INotificationRecipientResolver"/> that resolves
/// recipient user IDs by role from the read-only AccountsDb projections.
/// </summary>
public class NotificationRecipientResolver : INotificationRecipientResolver
{
    private readonly TenantDbContext _tenantDbContext;

    public NotificationRecipientResolver(TenantDbContext tenantDbContext)
    {
        _tenantDbContext = tenantDbContext;
    }

    /// <inheritdoc />
    public async Task<List<Guid>> ResolveUserIdsByRoleNamesAsync(List<string> roleNames, Guid? tenantId)
    {
        if (roleNames == null || roleNames.Count == 0)
            return new List<Guid>();

        var query = _tenantDbContext.ReadOnlyAccountUsers
            .Where(u => !u.IsDisabled && !u.IsDefault)
            .Where(u => u.UserRoles != null && u.UserRoles.Any(ur => ur.Role != null && !string.IsNullOrEmpty(ur.Role.FullName) && roleNames.Contains(ur.Role.FullName)));

        if (tenantId.HasValue)
            query = query.Where(u => u.TenantId == tenantId.Value);
        else
            query = query.Where(u => u.TenantId == null);

        return await query.Select(u => u.Id).Distinct().ToListAsync();
    }

    /// <inheritdoc />
    public async Task<List<Guid>> ResolveUserIdsByRoleNameAsync(string role, Guid? tenantId)
    {
        if (string.IsNullOrWhiteSpace(role))
            return new List<Guid>();

        var query = _tenantDbContext.ReadOnlyAccountUsers
            .Where(u => !u.IsDisabled && !u.IsDefault)
            .Where(u => u.UserRoles != null && u.UserRoles.Any(ur => ur.Role != null && ur.Role.Name == role));

        if (tenantId.HasValue)
            query = query.Where(u => u.TenantId == tenantId.Value);
        else
            query = query.Where(u => u.TenantId == null);

        return await query.Select(u => u.Id).Distinct().ToListAsync();
    }
}

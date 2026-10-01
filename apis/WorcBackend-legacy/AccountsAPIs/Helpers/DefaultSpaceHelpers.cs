namespace AccountsAPIs.Helpers;

/// <summary>
/// Helper for creating the default "Central" space that every tenant owns.
/// </summary>
public static class DefaultSpaceHelpers
{
    private const string CentralName = "Central";
    private const string CentralDescription = "The default space for shared resources, workflows, agents, and content accessible across the organization.";

    /// <summary>
    /// Ensures the given tenant has the default "Central" space. Idempotent: a no-op when a
    /// default space already exists for the tenant.
    /// </summary>
    /// <remarks>
    /// Uses raw SQL on purpose. The <c>AccountsDbContext.SaveChanges</c> override stamps every
    /// newly added <see cref="IMustHaveTenant"/> entity with the current request's tenant id, which
    /// would overwrite the new tenant's id at both seed time (no request context) and when a Super
    /// Admin creates another tenant.
    /// </remarks>
    public static async Task EnsureDefaultSpaceAsync(
        AccountsDbContext accountsDbContext,
        Guid tenantId,
        Guid createdByUserId,
        Guid lastModifiedByUserId,
        ILogger logger)
    {
        try
        {
            // Ignore query filters: the current request's tenant filter must not hide the target tenant.
            var hasDefaultSpace = await accountsDbContext.Spaces
                .IgnoreQueryFilters()
                .AnyAsync(w => w.TenantId == tenantId && w.IsDefault);

            // Default space already exists for this tenant
            if (hasDefaultSpace) return;

            // Insert the default "Central" space directly via raw SQL
            var centralSpaceId = Guid.NewGuid();
            var now = DateTimeOffset.UtcNow;
            await accountsDbContext.Database.ExecuteSqlInterpolatedAsync(
                $@"INSERT INTO ""Spaces"" (""Id"", ""TenantId"", ""Name"", ""Description"", ""IsDefault"", ""CreatedByUserId"", ""CreatedOn"", ""LastModifiedByUserId"", ""LastModifiedOn"", ""IsDisabled"")
                  VALUES ({centralSpaceId}, {tenantId}, {CentralName}, {CentralDescription}, {true}, {createdByUserId}, {now}, {lastModifiedByUserId}, {now}, {false})");
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to seed the default Central space for tenant {TenantId}.", tenantId);
        }
    }
}

/* https://aspnano.com/build-multi-tenant-application-core-asp-net-7/
 * https://aspnano.com/asp-net-core-multi-tenant-app-multiple-databases-guide/
 * https://codewithmukesh.com/blog/multitenancy-in-aspnet-core/
*/
using System.Text.Json;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace AccountsAPIs.Data;

public partial class AccountsDbContext : IdentityDbContext<
        AccountUser,
        AccountRole,
        Guid,
        IdentityUserClaim<Guid>,
        AccountUserRole,
        IdentityUserLogin<Guid>,
        IdentityRoleClaim<Guid>,
        IdentityUserToken<Guid>>
{
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private Guid CurrentTenantId { get; set; }
    private Guid CurrentUserId { get; set; }

    public AccountsDbContext(
        ICurrentTenantService currentTenantService,
        IHttpContextAccessor httpContextAccessor,
        DbContextOptions<AccountsDbContext> options) : base(options)
    {
        _currentTenantService = currentTenantService;
        CurrentTenantId = _currentTenantService.CurrentTenantId;
        _httpContextAccessor = httpContextAccessor;

    }

    private static string? GetChanges(EntityEntry entry) => entry.State switch
    {
        EntityState.Added => JsonSerializer.Serialize(entry.CurrentValues.Properties.ToDictionary(p => p.Name, p => entry.CurrentValues[p])),
        EntityState.Deleted => JsonSerializer.Serialize(entry.OriginalValues.Properties.ToDictionary(p => p.Name, p => entry.OriginalValues[p])),
        EntityState.Modified => JsonSerializer.Serialize(entry.Properties.Where(p => p.IsModified)
        .ToDictionary(k => k.Metadata.Name, v => new { NewValue = v.CurrentValue, OldValue = v.OriginalValue })),
        _ => null
    };
}
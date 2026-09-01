namespace AccountsAPIs.Helpers;

/// <summary>
/// Helpers for account user role and space management, shared by the account users table service.
/// </summary>
public static class AccountUsersHelper
{
    // Loads all roles once per request, ordered by Seq. The role set is small and fixed,
    // so this single query also feeds the transform and app validation below.
    public static async Task<List<AccountRole>> FetchAllRolesAsync(RoleManager<AccountRole> roleManager)
    {
        return await roleManager.Roles.OrderBy(o => o.Seq).ToListAsync();
    }

    // Names (IdentityRole "Name") of the provided roles that belong to the requesting app.
    public static HashSet<string?> GetAppRoleNames(List<AccountRole> appRoles, PlatformAppsEnum platformApp)
    {
        return appRoles
            .Where(w => w.AppCode == platformApp.ToAppCode())
            .Select(s => s.Name)
            .ToHashSet(StringComparer.OrdinalIgnoreCase);
    }

    // Transform roles "FullName" to "Name". Frontend will return roles in "FullName" of IdentityRole. However userManger work with "Name" of IdentityRole
    public static List<string?> TransformRoleFullNameToName(List<AccountRole> appRoles, List<string> rolesToTransform)
    {
        return appRoles
            .Where(w => rolesToTransform.Contains(w.FullName, StringComparer.OrdinalIgnoreCase))
            .OrderBy(o => o.Seq)
            .Select(s => s.Name)
            .ToList();
    }

    // Persists the user's selected spaces to the SpaceUser table. Removes any
    // previously assigned spaces that are no longer selected and adds the new ones.
    public static async Task SyncUserSpacesAsync(IUnitOfWork unitOfWork, ICurrentTenantService currentTenantService, ILogger logger, Guid actingUserId, Guid userId, List<string>? spaceIds)
    {
        try
        {
            var tenantId = currentTenantService.CurrentTenantId;

            // Parse the selected space IDs (ignore invalid entries).
            var selectedIds = (spaceIds ?? new List<string>())
                .Where(id => Guid.TryParse(id, out _))
                .Select(Guid.Parse)
                .ToHashSet();

            // Fetch the user's current space memberships.
            var existing = await unitOfWork.SpaceUserRepo
                .GetByConditionAsync(w => w.UserId == userId && w.TenantId == tenantId)
                .ToListAsync();

            // Remove memberships that are no longer selected.
            var toRemove = existing.Where(w => !selectedIds.Contains(w.SpaceId)).ToList();
            if (toRemove.Count > 0)
                unitOfWork.SpaceUserRepo.Delete(toRemove);

            // Add memberships for newly selected spaces.
            var existingSpaceIds = existing.Select(w => w.SpaceId).ToHashSet();
            var toAdd = selectedIds
                .Where(id => !existingSpaceIds.Contains(id))
                .Select(id => new SpaceUser
                {
                    UserId = userId,
                    SpaceId = id,
                    TenantId = tenantId,
                    IsActive = true,
                    CreatedByUserId = actingUserId,
                    LastModifiedByUserId = actingUserId
                })
                .ToList();

            if (toAdd.Count > 0)
                await unitOfWork.SpaceUserRepo.InsertAsync(toAdd);

            if (toRemove.Count > 0 || toAdd.Count > 0)
                await unitOfWork.SaveAsync();
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to sync spaces for user {UserId}.", userId);
        }
    }
}
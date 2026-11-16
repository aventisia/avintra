namespace AccountsAPIs.Helpers;

/// <summary>
/// Detects tenants whose organization profile free sign-up deferred to checkout.
/// </summary>
public static class TenantSetupHelpers
{
    /// <summary>
    /// True for an Unspecified tenant, or an Organization tenant still named after its creator's email.
    /// </summary>
    public static async Task<bool> IsSetupPendingAsync(IUnitOfWork unitOfWork, Tenant? tenant)
    {
        if (tenant == null)
            return false;

        if (tenant.Type == TenantTypesEnum.Unspecified)
            return true;

        if (tenant.Type != TenantTypesEnum.Organization)
            return false;

        var normalizedName = tenant.Name.Trim().ToUpperInvariant();
        return await unitOfWork.AccountUserRepo
            .GetByConditionAsync(u => u.Id == tenant.CreatedByUserId && u.NormalizedEmail == normalizedName)
            .AnyAsync();
    }
}

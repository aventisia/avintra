namespace AccountsAPIs.Services;

public partial class TenantAccountService
{
    private (bool IsAvailable, int StatusCode, string Message) GetSsoAvailability()
    {
        if (!_environmentConfig.IsSsoAllowedForDeployment)
        {
            return (false, 400, "Single sign-on is not available in the Community edition.");
        }

        if (!_environmentConfig.MicrosoftSsoEnabled)
        {
            return (false, 400, "Single sign-on is not enabled for this deployment.");
        }

        return (true, 200, string.Empty);
    }

    private void ApplySsoAvailability(TenantPreferenceDto dto)
    {
        dto.IsSSOAvailable = _environmentConfig.MicrosoftSsoEnabled && _environmentConfig.IsSsoAllowedForDeployment;
    }

    private async Task<SsoDisableWarningDto?> BuildSsoDisableWarningAsync()
    {
        var taRoleId = await _unitOfWork.AccountRoleRepo
            .GetByConditionAsync(r => r.Name == CustomRolesEnum.TA.ToString())
            .Select(r => (Guid?)r.Id)
            .FirstOrDefaultAsync();

        var affectedAdmins = new List<string>();
        if (taRoleId.HasValue)
        {
            var passwordlessAdminNames = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(u =>
                    u.TenantId == _tenantId &&
                    !u.IsDisabled &&
                    u.PasswordHash == null &&
                    u.UserRoles.Any(ur => ur.RoleId == taRoleId.Value))
                .Select(u => u.UserName)
                .ToListAsync();

            affectedAdmins = passwordlessAdminNames
                .Where(n => !string.IsNullOrWhiteSpace(n))
                .Select(n => n!)
                .ToList();
        }

        var affectedUserCount = await _unitOfWork.AccountUserRepo
            .GetByConditionAsync(u => u.TenantId == _tenantId && !u.IsDisabled && u.PasswordHash == null)
            .CountAsync();

        if (affectedUserCount == 0) return null;

        return new SsoDisableWarningDto
        {
            WarnOnly = true,
            AffectedAdmins = affectedAdmins,
            AffectedUserCount = affectedUserCount,
            RecoveryHint = "Affected users can set a password from the login screen using Forgot password, then sign in with their email and password."
        };
    }
}

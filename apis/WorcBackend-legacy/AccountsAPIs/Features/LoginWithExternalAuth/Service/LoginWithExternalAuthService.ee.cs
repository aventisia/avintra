namespace AccountsAPIs.Services;

public partial class LoginWithExternalAuthService
{
    private string? GetSsoUnavailableMessage()
    {
        if (!_environmentConfig.IsSsoAllowedForDeployment)
        {
            return "Single sign-on is not available in the Community edition.";
        }

        if (!_environmentConfig.MicrosoftSsoEnabled)
        {
            return "Single sign-on is not enabled for this deployment.";
        }

        return null;
    }

    private async Task<Tenant?> ResolveSsoTenantByDomainAsync(string? email)
    {
        var emailDomain = ExtractDomainFromEmailUtil.ExtractDomainFromEmail(email);
        if (string.IsNullOrWhiteSpace(emailDomain)) return null;

        return await _unitOfWork.TenantRepo
            .GetByConditionAsync(t =>
                t.Domain != string.Empty &&
                t.IsSSOEnabled &&
                t.Type == TenantTypesEnum.Organization &&
                t.Domain.ToLower() == emailDomain)
            .AsNoTracking()
            .FirstOrDefaultAsync();
    }
}

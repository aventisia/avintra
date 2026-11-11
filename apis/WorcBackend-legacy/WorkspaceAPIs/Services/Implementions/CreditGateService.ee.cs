namespace WorkspaceAPIs.Services;

/// <summary>
/// Default credit gate. Reads the read-only TenantCredits projection from AccountsDb so the
/// gate works identically in request, hub, trigger and background/scheduler contexts, none of
/// which can rely on an end-user access token to call AccountsAPIs over HTTP.
/// </summary>
public class CreditGateService : ICreditGateService
{
    /// <summary>
    /// The reason recorded on a job that was never dispatched because the tenant ran out of credits.
    /// </summary>
    public const string InsufficientCreditsRemark = "Insufficient credits";

    // Mirrors the threshold used by the LLM credit gate (AspNetToolkit.LLMDataExtractionService)
    // and the Studio execution guard so Runner jobs are gated consistently with LLM calls.
    private const double MinimumRequiredCredits = 10;

    private readonly ILogger<CreditGateService> _logger;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly TenantDbContext _tenantDbContext;

    public CreditGateService(
        ILogger<CreditGateService> logger,
        EnvironmentConfig environmentConfig,
        TenantDbContext tenantDbContext)
    {
        _logger = logger;
        _environmentConfig = environmentConfig;
        _tenantDbContext = tenantDbContext;
    }

    public async Task<bool> HasSufficientCreditsAsync(Guid tenantId)
    {
        // Enterprise (non-commercial) tenants are not credit-metered - the credit-usage API
        // reports an effectively unlimited balance for them - so the gate never blocks them.
        if (!string.Equals(
                _environmentConfig.OnPremTenantType,
                OnPremTenantTypesEnum.Commercial.ToString(),
                StringComparison.OrdinalIgnoreCase))
        {
            return true;
        }

        if (tenantId == Guid.Empty)
        {
            _logger.LogWarning("Credit gate could not resolve a tenant id for the job; failing closed.");
            return false;
        }

        try
        {
            // Mirror the AccountsAPIs available-credits calculation: sum the non-expired
            // credit allocations for the tenant (CreditUsageService.GetAvailableCreditsAsync).
            var today = DateTimeOffset.UtcNow.Date;
            var availableCredits = await _tenantDbContext.ReadOnlyTenantCredits
                .Where(w => w.TenantId == tenantId && w.ExpiredOn.Date > today)
                .SumAsync(s => s.AvailableCredits);

            if (availableCredits < MinimumRequiredCredits)
            {
                _logger.LogWarning(
                    "Tenant {TenantId} has insufficient credits ({AvailableCredits}) to dispatch a job.",
                    tenantId, availableCredits);
                return false;
            }

            return true;
        }
        catch (Exception ex)
        {
            // Fail closed: never dispatch a job whose credit position could not be established.
            _logger.LogError(ex, "Failed to evaluate the credit balance for tenant {TenantId}; blocking job dispatch.", tenantId);
            return false;
        }
    }

    public void CancelForInsufficientCredits(Job job)
    {
        job.Status = JobStatusEnum.Canceled;
        job.EndTime = DateTimeOffset.UtcNow;
        job.Remark = InsufficientCreditsRemark;
    }
}

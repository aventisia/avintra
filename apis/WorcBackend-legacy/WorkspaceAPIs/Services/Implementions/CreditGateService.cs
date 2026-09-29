namespace WorkspaceAPIs.Services;

/// <summary>
/// Default credit gate. Reads the available credit balance from AccountsAPIs.
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
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly EnvironmentConfig _environmentConfig;

    public CreditGateService(
        ILogger<CreditGateService> logger,
        IHttpContextAccessor httpContextAccessor,
        EnvironmentConfig environmentConfig)
    {
        _logger = logger;
        _httpContextAccessor = httpContextAccessor;
        _environmentConfig = environmentConfig;
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
            var accountsApiBaseUrl = _environmentConfig.AppBaseUrl?.TrimEnd('/');
            if (string.IsNullOrWhiteSpace(accountsApiBaseUrl))
            {
                _logger.LogError("Accounts API base URL is not configured; blocking job dispatch.");
                return false;
            }

            var jwt = GetJwtOfRequestUtil.GetJwtOfRequest(_httpContextAccessor.HttpContext);
            var response = await RequestExternalAPIUtil.RequestExternalAPI(
                CrudTypesEnum.Read,
                $"https://{accountsApiBaseUrl}/accounts/api/credit-usage/available-credits",
                jwt);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Accounts API credit balance request returned {StatusCode} for tenant {TenantId}; blocking job dispatch.",
                    (int)response.StatusCode,
                    tenantId);
                return false;
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var availableCreditsResponse = JsonConvert.DeserializeObject<ServiceResponse<AvailableCreditResponse>>(responseContent);
            var availableCredits = availableCreditsResponse?.Data?.AvailableCredits;

            if (!availableCredits.HasValue)
            {
                _logger.LogWarning(
                    "Accounts API returned no available credit balance for tenant {TenantId}; blocking job dispatch.",
                    tenantId);
                return false;
            }

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

    private sealed class AvailableCreditResponse
    {
        public double AvailableCredits { get; set; }
    }
}

namespace WorkspaceAPIs.Jobs
{
    /// <summary>
    /// A job that handles the cleanup of tenant history records based on a retention policy.
    /// It fetches tenant subscription data from an external API and processes the cleanup.
    /// </summary>
    public class TenantHistoryCleanupJob : IJob
    {
        private readonly WorkspaceInternalDbContext _workspaceInternalDbContext;
        private readonly ILogger<TenantHistoryCleanupJob> _logger;
        private readonly EnvironmentConfig _environmentConfig;

        public TenantHistoryCleanupJob(
            WorkspaceInternalDbContext workspaceInternalDbContext,
            ILogger<TenantHistoryCleanupJob> logger,
            EnvironmentConfig environmentConfig)
        {
            _workspaceInternalDbContext = workspaceInternalDbContext;
            _logger = logger;
            _environmentConfig = environmentConfig;
        }

        // The main method that Quartz calls to execute the job. It processes tenant history cleanup.
        public async Task Execute(IJobExecutionContext context)
        {
            var currentDateTime = DateTimeOffset.UtcNow;

            try
            {
                // Call external API to get tenant subscription information
                HttpResponseMessage httpResponse = await RequestExternalAPIUtil.RequestExternalAPI(
                    CrudTypesEnum.Read,
                    "http://localhost:4000/api/tenant-subscriptions/retention",
                    null,
                    null
                );

                // Handle failed external API call
                if (!httpResponse.IsSuccessStatusCode)
                {
                    _logger.LogError("External API call failed. Status Code: {StatusCode}, Reason: {ReasonPhrase}",
                        httpResponse.StatusCode,
                        httpResponse.ReasonPhrase
                    );

                    return;
                }

                // Parse the response content
                var responseContent = await httpResponse.Content.ReadAsStringAsync();

                // Deserialize the response into tenant subscription data
                var tenantSubscriptions = JsonConvert.DeserializeObject<ServiceResponse<List<TenantSubscriptionInfoDto>>>(
                    responseContent,
                    new JsonSerializerSettings
                    {
                        MissingMemberHandling = MissingMemberHandling.Ignore,
                        ContractResolver = new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver()
                    }
                );

                // Validate the external service response
                if (tenantSubscriptions?.StatusCode != 200 || tenantSubscriptions?.Data == null)
                {
                    _logger.LogError("Failed to deserialize the external API response or no valid data found.");
                    return; // Exit early if the data is not valid or missing
                }

                // Process each tenant's subscription and cleanup their history records
                foreach (var tenantSubscription in tenantSubscriptions.Data)
                {
                    var historyRetentionDays = _environmentConfig.IsCommunityDeployment
                        ? 1
                        : tenantSubscription.HistoryRetentionDays;

                    // IMPORTANT NOTE: an unlimited plan stores int.MaxValue, which overflows AddDays;
                    // unlimited retention means "no cleanup", never a purge.
                    if (historyRetentionDays == int.MaxValue)
                    {
                        continue;
                    }

                    var retentionDate = currentDateTime.AddDays(-historyRetentionDays).Date;

                    // Retrieve tenant history records older than the retention date
                    var jobs = await _workspaceInternalDbContext.Jobs
                        .Where(w => w.TenantId == tenantSubscription.TenantId && w.CreatedOn.Date <= retentionDate)
                        .ToListAsync();

                    // If old records are found, delete them
                    if (jobs.Any())
                    {
                        _workspaceInternalDbContext.Jobs.RemoveRange(jobs);
                        await _workspaceInternalDbContext.SaveChangesAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while processing the tenant history retention job.");
            }
        }
    }
}

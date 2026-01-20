namespace AccountsAPIs.Services;

public class InstanceUsageStartupService : IHostedService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<InstanceUsageStartupService> _logger;
    private readonly InstanceConfig _instanceConfig;
    private readonly AppRuntimeSettings _appRuntimeSettings;

    public InstanceUsageStartupService(IServiceScopeFactory serviceScopeFactory, ILogger<InstanceUsageStartupService> logger, InstanceConfig instanceConfig, AppRuntimeSettings appRuntimeSettings)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
        _instanceConfig = instanceConfig;
        _appRuntimeSettings = appRuntimeSettings;
    }

    // This method will be called when the application starts. It collects metrics and posts them to the external API.
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var currentDateTime = DateTimeOffset.UtcNow;
        string errorMessage = string.Empty;

        // Log that the job started
        _logger.LogInformation($"Instance usage startup task started at {currentDateTime:O}");

        try
        {
            // Create a scope and resolve IInstanceService
            using (var scope = _serviceScopeFactory.CreateScope())
            {
                var instanceService = scope.ServiceProvider.GetRequiredService<IInstanceService>();

                // Collect metrics such as user count and job stats from the instance service
                var serviceResponse = await instanceService.CollectMetricsAsync("StartupService");

                // Check if data is retrieved successfully
                if (serviceResponse.Data == null || serviceResponse.StatusCode != 200)
                {
                    _logger.LogError("Failed to retrieve data from the Workspace API. Status Code: {StatusCode}, Message: {Message}, Data: {Data}", serviceResponse.StatusCode, serviceResponse.Message, serviceResponse.Data);
                    errorMessage = $"Workspace API is not responding or not running. Please contact the support team.";
                    throw new InvalidOperationException(errorMessage);
                }

                // Post the collected metrics to the external API for processing
                await instanceService.PostMetricsToApiAsync(serviceResponse.Data);

                // Fail startup if the tenant configuration is invalid
                if (!_instanceConfig.TenantType.Equals(_appRuntimeSettings.TenantType.ToString()))
                {
                    _logger.LogError("Startup aborted: invalid tenant configuration detected.");
                    errorMessage = "The tenant type is invalid. Please contact the support team.";
                    throw new InvalidOperationException(errorMessage);
                }

                // Fail if contract has not started
                if (!_appRuntimeSettings.IsContractStarted)
                {
                    _logger.LogError("Contract has not started. Startup cannot continue. Please contact the support team.");
                    errorMessage = "Contract has not started. Please contact the support team";
                    throw new InvalidOperationException(errorMessage);
                }

                // Fail if contract expired
                if (_appRuntimeSettings.IsContractExpired)
                {
                    _logger.LogError("Contract has expired. Startup cannot continue. Please contact the support team.");
                    errorMessage = "Contract has expired. Please contact the support team.";
                    throw new InvalidOperationException(errorMessage);
                }

                // Fail if login is disabled
                if (_appRuntimeSettings.IsLoginDisabled)
                {
                    _logger.LogError("Login is disabled. Startup cannot continue. Please contact the support team.");
                    errorMessage = "Login is disabled. Please contact the support team.";
                    throw new InvalidOperationException(errorMessage);
                }

                // Log successful completion of the startup task
                _logger.LogInformation($"Instance usage startup task completed successfully at {currentDateTime:O}");

            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while executing the instance usage startup task.");
            throw new InvalidOperationException(errorMessage);
        }
    }

    /// <summary>
    /// This method will be called when the application is stopping.
    /// </summary>
    public Task StopAsync(CancellationToken cancellationToken)
    {
        // Optionally add any cleanup logic if required
        _logger.LogInformation("Instance usage startup task is stopping.");
        return Task.CompletedTask;
    }
}
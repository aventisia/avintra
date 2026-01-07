namespace AccountsAPIs.Services;

public class InstanceUsageStartupService : IHostedService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<InstanceUsageStartupService> _logger;
    private readonly IHostEnvironment _hostEnvironment;
    private readonly AppRuntimeSettings _appRuntimeSettings;

    public InstanceUsageStartupService(IServiceScopeFactory serviceScopeFactory, ILogger<InstanceUsageStartupService> logger, IHostEnvironment hostEnvironment, AppRuntimeSettings appRuntimeSettings)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
        _hostEnvironment = hostEnvironment;
        _appRuntimeSettings = appRuntimeSettings;
    }

    // This method will be called when the application starts. It collects metrics and posts them to the external API.
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var currentDateTime = DateTimeOffset.UtcNow;

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
                    _logger.LogError("Failed to retrieve instance metrics data. Startup cannot continue. Please contact the support team. Message: {Message}", serviceResponse.Message);
                    throw new InvalidOperationException($"Failed to retrieve instance metrics data. Please contact the support team. Message: {serviceResponse.Message}");
                }

                // Post the collected metrics to the external API for processing
                await instanceService.PostMetricsToApiAsync(serviceResponse.Data);

                // Log successful completion of the startup task
                _logger.LogInformation($"Instance usage startup task completed successfully at {currentDateTime:O}");

                // Fail if contract expired
                if (_appRuntimeSettings.IsContractExpired)
                {
                    _logger.LogError("Contract has expired. Startup cannot continue. Please contact the support team.");
                    throw new InvalidOperationException("Contract has expired. Please contact the support team.");
                }

                // Fail if login is disabled
                if (_appRuntimeSettings.IsLoginDisabled)
                {
                    _logger.LogError("Login is disabled. Startup cannot continue. Please contact the support team.");
                    throw new InvalidOperationException("Login is disabled. Please contact the support team.");
                }
            }
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the startup process
            _logger.LogError(ex, "An error occurred while executing the instance usage startup task.");
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
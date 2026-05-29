namespace AccountsAPIs.Services;

public class InstanceUsageStartupService : IHostedService
{
    private readonly IServiceScopeFactory _serviceScopeFactory;
    private readonly ILogger<InstanceUsageStartupService> _logger;
    private readonly EnvironmentConfig _environmentConfig;

    public InstanceUsageStartupService(
        IServiceScopeFactory serviceScopeFactory,
        ILogger<InstanceUsageStartupService> logger,
        EnvironmentConfig environmentConfig)
    {
        _serviceScopeFactory = serviceScopeFactory;
        _logger = logger;
        _environmentConfig = environmentConfig;
    }

    // This method will be called when the application starts. It collects metrics and posts them to the external API.
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var currentDateTime = DateTimeOffset.UtcNow;
        string errorMessage = string.Empty;

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
                    _logger.LogError("Failed to retrieve data from the Workspace apis. Status Code: {StatusCode}, Message: {Message}, Data: {Data}", serviceResponse.StatusCode, serviceResponse.Message, serviceResponse.Data);
                    errorMessage = $"Workspace apis are not responding or not running. Please contact the support team.";
                    throw new InvalidOperationException(errorMessage);
                }

                // Post the collected metrics to the external API for processing
                await instanceService.PostMetricsToApiAsync(serviceResponse.Data);

                // Fail if contract has not started
                if (_environmentConfig.OnPremContractStart.Date > currentDateTime.Date)
                {
                    _logger.LogError("Contract has not started. Please contact the support team.");
                    // errorMessage = "Contract has not started. Please contact the support team";
                    // throw new InvalidOperationException(errorMessage);
                }

                // Fail if login is disabled
                if (_environmentConfig.OnPremLoginDisabled)
                {
                    _logger.LogError("Login is disabled. Please contact the support team.");
                    // errorMessage = "Login is disabled. Please contact the support team.";
                    // throw new InvalidOperationException(errorMessage);
                }
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
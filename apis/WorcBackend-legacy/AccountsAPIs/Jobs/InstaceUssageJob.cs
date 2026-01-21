namespace AccountsAPIs.Jobs;

public class InstanceUsageJob : IJob
{
    private readonly IInstanceService _instanceService;
    private readonly ILogger<InstanceUsageJob> _logger;
    private readonly IHostEnvironment _hostEnvironment;

    public InstanceUsageJob(IInstanceService instanceService, ILogger<InstanceUsageJob> logger, IHostEnvironment hostEnvironment)
    {
        _instanceService = instanceService;
        _logger = logger;
        _hostEnvironment = hostEnvironment;
    }

    // Main method for Quartz job execution. Collects metrics and posts them to the API.
    public async Task Execute(IJobExecutionContext context)
    {
        // Record the current UTC time to log the job start and end times
        var currentDateTime = DateTimeOffset.UtcNow;

        // Log the start of the job execution
        _logger.LogInformation($"Instance usage job started at {currentDateTime:O}");

        try
        {
            // Collect metrics such as user count and job statistics from the instance service
            var serviceResponse = await _instanceService.CollectMetricsAsync("BackgroundService");

            if (serviceResponse.Data != null || serviceResponse.StatusCode == 200)
            {
                // Post the collected metrics to an external API for processing
                await _instanceService.PostMetricsToApiAsync(serviceResponse.Data);

                // Log successful completion of the job
                _logger.LogInformation($"Instance usage job completed successfully at {currentDateTime:O}");
            }
            else
            {
                // Log failure if the metrics collection was unsuccessful
                _logger.LogWarning($"Metrics collection failed with message: {serviceResponse.Message}");
            }
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the job execution
            _logger.LogError(ex, "An error occurred while executing the instance usage job.");
        }
    }
}

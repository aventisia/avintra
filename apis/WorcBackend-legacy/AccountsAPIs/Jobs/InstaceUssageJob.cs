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


        try
        {
            // Collect metrics such as user count and job statistics from the instance service
            var serviceResponse = await _instanceService.CollectMetricsAsync("BackgroundService");

            if (serviceResponse.Data != null || serviceResponse.StatusCode == 200)
            {
                // Post the collected metrics to an external API for processing
                await _instanceService.PostMetricsToApiAsync(serviceResponse.Data);

            }
            else
            {
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while executing the instance usage job.");
        }
    }
}
namespace AccountsAPIs.Services;

/// <summary>
/// Provides services related to instance management, including collecting metrics and posting them to an external API.
/// </summary>
public interface IInstanceService
{
    /// <summary>
    /// Collects metrics related to the instance, such as user count and job statistics.
    /// </summary>
    /// <param name="source">The source identifier for the metric collection (e.g., service name).</param>
    /// <returns>A ServiceResponse containing the collected metrics.</returns>
    Task<ServiceResponse<InstanceRequestDto>> CollectMetricsAsync(string source);

    /// <summary>
    /// Posts the collected metrics to an external API for validation or processing.
    /// </summary>
    /// <param name="instanceRequestDto">The metrics data to be posted to the API.</param>
    /// <returns>A Task representing the asynchronous operation.</returns>
    Task PostMetricsToApiAsync(InstanceRequestDto instanceRequestDto);
}
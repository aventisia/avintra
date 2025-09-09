namespace AccountsAPIs.Services;
/// <summary>
/// Provides operations to retrieve and record credit usage data across services, resources, and users.
/// </summary>
public interface ICreditUsageService
{
    /// <summary>
    /// Retrieves summarized and detailed credit usage data for a specific service type and time range.
    /// </summary>
    /// <param name="startDate">The optional start date for the usage period.</param>
    /// <param name="endDate">The optional end date for the usage period.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a <see cref="CreditsUsageSummaryDto"/> with aggregated usage insights.
    /// </returns>
    Task<ServiceResponse<CreditsUsageSummaryDto>> GetCreditUsageAsync(DateTimeOffset? startDate, DateTimeOffset? endDate);

    /// <summary>
    /// Records a new credit usage entry into the system.
    /// </summary>
    /// <param name="creditUsageDto">The credit usage data to record.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates whether the insertion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> InsertCreditUsageAsync(CreditsUsageDto creditUsageDto);

    /// <summary>
    /// Exports the credit usage data as a CSV file based on the provided filters encapsulated in the request DTO.
    /// </summary>
    /// <param name="exportCreditUsageRequestDto">A DTO containing optional filters like service type, user IDs, agent IDs, AI model IDs, and date range to filter the credit usage data.</param>
    /// <returns>A service response containing the CSV file stream of the filtered credit usage data.</returns>
    Task<ServiceResponse<FileStreamResult>> ExportCreditUsageAsync(ExportCreditUsageRequestDto exportCreditUsageRequestDto);

    /// <summary>
    /// Retrieves the summary of available credits, including filtered credit usage data.
    /// </summary>
    /// <returns>A task with a service response containing the available credits summary.</returns>
    Task<ServiceResponse<AvailableCreditSummaryDto>> GetAvailableCreditsAsync();
}
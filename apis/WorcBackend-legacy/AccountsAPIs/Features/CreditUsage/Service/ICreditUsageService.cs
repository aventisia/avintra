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
    /// Records a single credit usage entry into the system.
    /// </summary>
    /// <param name="creditUsageDto">The credit usage data to record.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a boolean indicating whether the insertion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> RecordCreditUsageAsync(CreditsUsageDto creditUsageDto);

    /// <summary>
    /// Records multiple credit usage entries into the system.
    /// </summary>
    /// <param name="creditUsageDtos">A collection of credit usage data to record.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a boolean indicating whether the batch insertion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> RecordCreditUsagesAsync(IEnumerable<CreditsUsageDto> creditUsageDtos);

    /// <summary>
    /// Exports the credit usage data as a CSV file based on the provided filters encapsulated in the request DTO.
    /// </summary>
    /// <param name="exportCreditUsageRequestDto">A DTO containing optional filters like service type, user IDs, agent IDs and date range to filter the credit usage data.</param>
    /// <returns>A service response containing the CSV file stream of the filtered credit usage data.</returns>
    Task<ServiceResponse<FileStreamResult>> ExportCreditUsageAsync(ExportCreditUsageRequestDto exportCreditUsageRequestDto);

    /// <summary>
    /// Fetches the total available credits for a tenant, potentially including any filtered usage data.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation, containing a service response with the available credits.</returns>
    Task<ServiceResponse<AvailableCreditDto>> GetAvailableCreditsAsync();

    /// <summary>
    /// Retrieves a detailed summary of available credits, including monthly usage breakdown and any filtered data.
    /// </summary>
    /// <returns>A task that represents the asynchronous operation, containing a service response with the detailed available credits summary.</returns>
    Task<ServiceResponse<AvailableCreditSummaryDto>> GetAvailableCreditsSummaryAsync();
}
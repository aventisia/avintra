namespace AccountsAPIs.Services;
/// <summary>
/// Provides operations to retrieve and record credit usage data across services, resources, and users.
/// </summary>
public interface ICreditUsageService
{
    /// <summary>
    /// Retrieves summarized and detailed credit usage data for a specific service type and time range.
    /// </summary>
    /// <param name="creditServiceType">The optional type of credit-based service to filter usage data.</param>
    /// <param name="startDate">The optional start date for the usage period.</param>
    /// <param name="endDate">The optional end date for the usage period.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a <see cref="CreditsUsageSummaryDto"/> with aggregated usage insights.
    /// </returns>
    Task<ServiceResponse<CreditsUsageSummaryDto>> GetCreditUsageAsync(CreditServiceTypesEnum? creditServiceType, DateTime? startDate, DateTime? endDate);

    /// <summary>
    /// Records a new credit usage entry into the system.
    /// </summary>
    /// <param name="creditUsageDto">The credit usage data to record.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result indicates whether the insertion was successful.
    /// </returns>
    Task<ServiceResponse<bool>> InsertCreditUsageAsync(CreditsUsageDto creditUsageDto);

    /// <summary>
    /// Exports the credit usage data as a CSV file based on optional filters like service type and date range.
    /// </summary>
    /// <param name="creditServiceType">Optional filter to specify the type of credit service.</param>
    /// <param name="startDate">Optional start date to filter usage records.</param>
    /// <param name="endDate">Optional end date to filter usage records.</param>
    /// <returns>A service response containing the CSV file stream of the filtered credit usage data.</returns>
    Task<ServiceResponse<FileStreamResult>> ExportCreditUsageAsync(CreditServiceTypesEnum? creditServiceType, DateTime? startDate, DateTime? endDate);
}
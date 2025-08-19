namespace AccountsAPIs.Services
{
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
    }
}

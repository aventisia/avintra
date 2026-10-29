namespace AccountsAPIs.Services;

/// <summary>
/// Provides operations to retrieve and record BYOK (Bring Your Own Key) consumption
/// data across services, resources, users, and credentials.
/// </summary>
public interface IByokUsageService
{
    /// <summary>
    /// Retrieves summarized and detailed BYOK consumption data for a specific time range.
    /// </summary>
    /// <param name="startDate">The optional start date for the usage period.</param>
    /// <param name="endDate">The optional end date for the usage period.</param>
    /// <param name="filterBySpaces">When true, restricts results to the given spaces.</param>
    /// <param name="spaceIds">The set of space GUIDs to include when filtering.</param>
    /// <param name="includeCentral">When filtering, whether Central-space usage (null SpaceId) is included.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains a <see cref="ByokUsageSummaryDto"/> with aggregated usage insights.
    /// </returns>
    Task<ServiceResponse<ByokUsageSummaryDto>> GetByokUsageAsync(
        DateTimeOffset? startDate,
        DateTimeOffset? endDate,
        bool filterBySpaces = false,
        List<Guid>? spaceIds = null,
        bool includeCentral = true
    );

    /// <summary>
    /// Records a single BYOK consumption entry into the system.
    /// </summary>
    /// <param name="byokUsageDto">The BYOK consumption data to record.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the recorded BYOK usage details.
    /// </returns>
    Task<ServiceResponse<RecordedByokUsageDto>> RecordByokUsageAsync(ByokUsageDto byokUsageDto);

    /// <summary>
    /// Records multiple BYOK consumption entries into the system.
    /// </summary>
    /// <param name="byokUsageDtos">A collection of BYOK consumption data to record.</param>
    /// <returns>
    /// A task representing the asynchronous operation. The result contains the recorded BYOK usage details for each service type.
    /// </returns>
    Task<ServiceResponse<List<RecordedByokUsageDto>>> RecordByokUsagesAsync(
        IEnumerable<ByokUsageDto> byokUsageDtos
    );

    /// <summary>
    /// Exports the BYOK consumption data as a CSV file based on the provided filters encapsulated in the request DTO.
    /// </summary>
    /// <param name="exportByokUsageRequestDto">A DTO containing optional filters like service type, user IDs, agent IDs and date range to filter the BYOK consumption data.</param>
    /// <returns>A service response containing the CSV file stream of the filtered BYOK consumption data.</returns>
    Task<ServiceResponse<FileStreamResult>> ExportByokUsageAsync(
        ExportByokUsageRequestDto exportByokUsageRequestDto
    );
}

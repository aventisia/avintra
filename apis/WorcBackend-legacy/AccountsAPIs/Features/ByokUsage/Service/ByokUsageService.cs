using AccountsAPIs.Helpers;

namespace AccountsAPIs.Services;

public class ByokUsageService : IByokUsageService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<ByokUsageService> _logger;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public ByokUsageService(
        IUnitOfWork unitOfWork,
        ILogger<ByokUsageService> logger,
        IHttpContextAccessor httpContextAccessor
    )
    {
        _unitOfWork = unitOfWork;
        _logger = logger;

        // Extract user ID from JWT token in the HTTP context
        _userId = Guid.Parse(
            httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString()
        );

        // Extract tenant ID from JWT token claims
        _tenantId = Guid.Parse(
            httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString()
        );
    }

    // Retrieves the BYOK consumption for a given user or service.
    // filterBySpaces: when false, no space filtering is applied (all spaces).
    // spaceIds: the set of space GUIDs to include when filterBySpaces is true.
    // includeCentral: when filterBySpaces is true, whether null-SpaceId (Central) usage is included.
    public async Task<ServiceResponse<ByokUsageSummaryDto>> GetByokUsageAsync(
        DateTimeOffset? startDate,
        DateTimeOffset? endDate,
        bool filterBySpaces = false,
        List<Guid>? spaceIds = null,
        bool includeCentral = true
    )
    {
        // Initialize the default service response in case of failure
        var serviceResponse = new ServiceResponse<ByokUsageSummaryDto>
        {
            Data = null,
            Message = "Failed to retrieve BYOK usage. Please try again.",
        };

        try
        {
            if (!startDate.HasValue || !endDate.HasValue)
            {
                startDate = DateTime.UtcNow.Date.AddDays(-6);
                endDate = DateTime.UtcNow.Date;
            }

            var tenant = await _unitOfWork
                .TenantRepo.GetByConditionAsync(w => w.Id == _tenantId)
                .FirstOrDefaultAsync();

            // If no tenant is found, log a warning and return failure message
            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found with ID: {TenantId}", _tenantId);
                serviceResponse.Message = "Tenant not found.";
                return serviceResponse;
            }

            // Build the query for ByokUsage with optional filters.
            var byokUsageQuery = _unitOfWork
                .ByokUsageRepo.GetByConditionAsync(w =>
                    w.UsedAt.Date >= startDate.Value
                    && w.UsedAt.Date <= endDate.Value
                    && w.TenantId == _tenantId
                    && (
                        !filterBySpaces
                        || (includeCentral && w.SpaceId == null)
                        || (w.SpaceId != null && spaceIds.Contains(w.SpaceId.Value))
                    )
                )
                .Include(i => i.UsedByUser)
                .AsQueryable();

            // Execute the query and retrieve filtered BYOK usage data
            var byokUsages = await byokUsageQuery.ToListAsync();

            // Build the BYOK usage summary DTO to return
            var byokUsageDto = new ByokUsageSummaryDto
            {
                // Group consumption by model provider, then by model within each
                // provider so charts never mix different unit types (tokens vs
                // seconds vs characters).
                Providers = byokUsages
                    .Where(w => !string.IsNullOrEmpty(w.Provider))
                    .GroupBy(g => g.Provider)
                    .Select(providerGroup => new ByokProviderUsageDto
                    {
                        Provider = providerGroup.Key,
                        Models = providerGroup
                            .GroupBy(g => g.Model ?? "Unspecified")
                            .Select(modelGroup => new ByokModelUsageDto
                            {
                                Model = modelGroup.Key,
                                UnitType = modelGroup.FirstOrDefault()?.UnitType,
                                TotalConsumption = CreditRoundingHelper.RoundToTwo(modelGroup.Sum(sm => sm.ConsumedUnit)),
                                UsageTimeline = modelGroup
                                    .GroupBy(g1 => g1.UsedAt.Date)
                                    .Select(s1 => new DataUsageDataPointDto
                                    {
                                        Date = s1.Key,
                                        TotalCount = CreditRoundingHelper.RoundToTwo(s1.Sum(x => x.ConsumedUnit)),
                                    })
                                    .OrderBy(o => o.Date)
                                    .ToList(),
                            })
                            .OrderByDescending(o => o.TotalConsumption)
                            .ToList(),
                    })
                    .OrderBy(o => o.Provider)
                    .ToList(),

                Users = byokUsages
                    .Where(w => w.UsedByUser != null && w.RefId != null)
                    .GroupBy(g => g.UsedByUserId)
                    .Select(s =>
                    {
                        var user = s.First().UsedByUser;
                        return new ByokUserUsageDto
                        {
                            Username = user.UserName,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            TotalConsumption = CreditRoundingHelper.RoundToTwo(byokUsages
                                .Where(w => w.UsedByUserId == user.Id)
                                .Sum(sm => sm.ConsumedUnit)),
                        };
                    })
                    .ToList(),

                Agents = byokUsages
                    .Where(w => !string.IsNullOrEmpty(w.TriggeredByAgent))
                    .GroupBy(g => g.TriggeredByAgent)
                    .Select(s =>
                    {
                        var agentName = s.Key;
                        return new ByokAgentUsageDto
                        {
                            AgentName = agentName,
                            TotalConsumption = CreditRoundingHelper.RoundToTwo(byokUsages
                                .Where(w => w.TriggeredByAgent == agentName)
                                .Sum(sm => sm.ConsumedUnit)),
                        };
                    })
                    .ToList(),
            };

            // Set the service response to indicate successful retrieval
            serviceResponse.Data = byokUsageDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "BYOK usage retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An error occurred while retrieving BYOK usage for TenantId: {TenantId}.",
                _tenantId
            );
        }

        return serviceResponse;
    }

    public async Task<ServiceResponse<RecordedByokUsageDto>> RecordByokUsageAsync(
        ByokUsageDto byokUsageDto
    )
    {
        // Initialize the default service response in case of failure
        var serviceResponse = ServiceResponse<RecordedByokUsageDto>.Create(
            "Failed to insert BYOK usage. Please try again later.",
            500
        );

        try
        {
            var tenant = await _unitOfWork
                .TenantRepo.GetByConditionAsync(w => w.Id == _tenantId)
                .FirstOrDefaultAsync();

            // If no tenant is found, log a warning and return failure message
            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found with ID: {TenantId}", _tenantId);
                serviceResponse.Message = "Tenant not found.";
                return serviceResponse;
            }

            // Map the DTO to the entity model and set the user ID
            var byokUsage = byokUsageDto.Adapt<ByokUsage>();
            byokUsage.UsedByUserId = byokUsageDto.UsedByUserId.HasValue
                ? byokUsageDto.UsedByUserId
                : _userId;
            byokUsage.SpaceId = byokUsageDto.SpaceId;

            // Insert the new BYOK usage record into the database
            await _unitOfWork.ByokUsageRepo.InsertAsync(byokUsage);

            // Commit the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "Database save failed during BYOK usage insertion for User ID: {UserId}.",
                    _userId
                );
                return serviceResponse;
            }

            // Build the recorded BYOK usage result.
            var recordedByokUsage = new RecordedByokUsageDto
            {
                ServiceType = byokUsageDto.ServiceType,
                ConsumedUnit = byokUsageDto.ConsumedUnit,
            };

            // Set the service response to indicate successful BYOK usage insertion
            return serviceResponse.Update(
                "BYOK usage recorded successfully.",
                200,
                recordedByokUsage
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An error occurred while recording BYOK usage for TenantId: {TenantId}.",
                _tenantId
            );
        }

        // Return the service response
        return serviceResponse;
    }

    public async Task<ServiceResponse<List<RecordedByokUsageDto>>> RecordByokUsagesAsync(
        IEnumerable<ByokUsageDto> byokUsageDtos
    )
    {
        // Initialize the default service response for multiple BYOK usage insertions
        var serviceResponse = ServiceResponse<List<RecordedByokUsageDto>>.Create(
            "Failed to insert BYOK usage records. Please try again later.",
            500
        );

        try
        {
            var tenant = await _unitOfWork
                .TenantRepo.GetByConditionAsync(w => w.Id == _tenantId)
                .FirstOrDefaultAsync();

            // If no tenant is found, log a warning and return failure message
            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found with ID: {TenantId}", _tenantId);
                serviceResponse.Message = "Tenant not found.";
                return serviceResponse;
            }

            // Initialize a list to collect BYOK usage records
            var byokUsages = new List<ByokUsage>();

            // Process each BYOK usage
            foreach (var byokUsageDto in byokUsageDtos)
            {
                // Map the DTO to the entity model and set the user ID
                var byokUsage = byokUsageDto.Adapt<ByokUsage>();
                byokUsage.UsedByUserId = byokUsageDto.UsedByUserId.HasValue
                    ? byokUsageDto.UsedByUserId
                    : _userId;
                byokUsage.SpaceId = byokUsageDto.SpaceId;

                // Add the BYOK usage to the list for batch insertion
                byokUsages.Add(byokUsage);
            }

            // Insert the new BYOK usage records into the database
            await _unitOfWork.ByokUsageRepo.InsertAsync(byokUsages);

            // Commit the changes to the database after processing all records
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "Database save failed during BYOK usage insertion for User ID: {UserId}.",
                    _userId
                );
                return serviceResponse;
            }

            // Build the recorded BYOK usage result from the inserted entities.
            var recordedByokUsages = byokUsages
                .Select(bu => new RecordedByokUsageDto
                {
                    ServiceType = bu.ServiceType,
                    ConsumedUnit = bu.ConsumedUnit,
                })
                .ToList();

            // Set the service response to indicate successful BYOK usage insertion
            return serviceResponse.Update(
                "BYOK usage records recorded successfully.",
                200,
                recordedByokUsages
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An error occurred while recording multiple BYOK usages for TenantId: {TenantId}.",
                _tenantId
            );
        }

        // Return the service response
        return serviceResponse;
    }

    // Exports BYOK usage data based on the provided filters into a downloadable CSV file.
    public async Task<ServiceResponse<FileStreamResult>> ExportByokUsageAsync(
        ExportByokUsageRequestDto exportByokUsageRequestDto
    )
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FileStreamResult>
        {
            Data = null,
            Message = "Failed to export BYOK usage data. Please try again.",
        };

        try
        {
            // Check if the StartDate or EndDate are not provided (null)
            if (
                !exportByokUsageRequestDto.StartDate.HasValue
                || !exportByokUsageRequestDto.EndDate.HasValue
            )
            {
                // If dates are missing, set default values:
                // - StartDate is 6 days before today
                // - EndDate is today
                exportByokUsageRequestDto.EndDate = DateTime.UtcNow.Date;
                exportByokUsageRequestDto.StartDate = DateTime.UtcNow.Date.AddDays(-6);
            }

            // Fetch the tenant details from the repository based on the TenantId
            var tenant = await _unitOfWork
                .TenantRepo.GetByConditionAsync(w => w.Id == _tenantId)
                .FirstOrDefaultAsync();

            // If no tenant is found, log a warning and return failure message
            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found with ID: {TenantId}", _tenantId);
                serviceResponse.Message = "Tenant not found.";
                return serviceResponse;
            }

            // Initialize base query and include related user information
            var byokUsageQuery = _unitOfWork
                .ByokUsageRepo.GetByConditionAsync(w =>
                    w.TenantId == _tenantId
                    && w.UsedAt.Date >= exportByokUsageRequestDto.StartDate
                    && w.UsedAt.Date <= exportByokUsageRequestDto.EndDate
                )
                .Include(i => i.UsedByUser)
                .OrderByDescending(o => o.UsedAt)
                .AsQueryable();

            // Filter by Service Types if any are specified in the request
            if (exportByokUsageRequestDto.ServiceTypes.Any())
            {
                byokUsageQuery = byokUsageQuery.Where(w =>
                    exportByokUsageRequestDto.ServiceTypes.Contains(w.ServiceType)
                );
            }

            // Filter by User IDs if provided (ensure UsedByUserId is not null)
            if (exportByokUsageRequestDto.UserIds.Any())
            {
                byokUsageQuery = byokUsageQuery.Where(w =>
                    w.UsedByUserId != null
                    && exportByokUsageRequestDto.UserIds.Contains(w.UsedByUserId.Value)
                );
            }

            // Filter by Agent IDs if provided (ensure RefId is not null and RefType is Agent)
            if (exportByokUsageRequestDto.AgentIds.Any())
            {
                byokUsageQuery = byokUsageQuery.Where(w =>
                    w.RefId != null
                    && w.RefType == UsageSourceTypesEnum.Agent
                    && exportByokUsageRequestDto.AgentIds.Contains(w.RefId.Value)
                );
            }

            // Fetch and map filtered BYOK usage records to DTOs for export
            var byokUsages = await byokUsageQuery
                .ProjectToType<ExportByokUsageResponseDto>()
                .ToListAsync();

            // Convert the retrieved data to CSV byte array for file export
            var csvBytes = CsvDataExporterUtil.ExportToCsvBytes(
                byokUsages,
                new List<string>
                {
                    "Date",
                    "Service",
                    "Service Unit",
                    "Unit Consumed",
                    "Credential",
                    "Type",
                    "Agent",
                    "User",
                    "Action",
                    "Triggered By",
                }
            );
            var stream = new MemoryStream(csvBytes);

            var fileResult = new FileStreamResult(stream, "text/csv")
            {
                FileDownloadName = $"byok-usage-{DateTime.UtcNow:dd/MM/yyyy}.csv",
            };

            serviceResponse.Data = fileResult;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "BYOK usage data exported successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while exporting BYOK usage data.");
        }

        return serviceResponse;
    }
}

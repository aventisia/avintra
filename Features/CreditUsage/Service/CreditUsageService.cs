namespace AccountsAPIs.Services;

public class CreditUsageService : ICreditUsageService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreditUsageService> _logger;
    private readonly DefaultTenantConfig _defaultTenantConfig;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public CreditUsageService(IUnitOfWork unitOfWork, ILogger<CreditUsageService> logger, IHttpContextAccessor httpContextAccessor, DefaultTenantConfig defaultTenantConfig)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _defaultTenantConfig = defaultTenantConfig;

        // Extract user ID from JWT token in the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Extract tenant ID from JWT token claims
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
    }

    // Retrieves the credit usage for a given user or service.
    public async Task<ServiceResponse<CreditsUsageSummaryDto>> GetCreditUsageAsync(DateTimeOffset? startDate, DateTimeOffset? endDate)
    {
        // Initialize the default service response in case of failure
        var serviceResponse = new ServiceResponse<CreditsUsageSummaryDto>
        {
            Data = null,
            Message = "Failed to retrieve credit usage. Please try again."
        };

        try
        {
            // Log the incoming request and filters for traceability
            _logger.LogInformation("Starting credit usage fetch. Filters - StartDate: {Start}, EndDate: {End}",
                startDate, endDate);

            // Build the query for CreditUsage with optional filters
            var creditUsageQuery = _unitOfWork.CreditUsageRepo
                    .GetAllAsync()
                    .Include(i => i.UsedByUser)
                    .AsQueryable();

            // Filter by start date if specified (records from this date forward)
            if (startDate.HasValue)
                creditUsageQuery = creditUsageQuery.Where(c => c.UsedAt.Date >= startDate.Value.Date);

            // Filter by end date if specified (records up to this date)
            if (endDate.HasValue)
                creditUsageQuery = creditUsageQuery.Where(c => c.UsedAt.Date <= endDate.Value.Date);

            // Execute the query and retrieve filtered credit usage data
            var creditUsages = await creditUsageQuery.ToListAsync();
            _logger.LogInformation("Fetched {Count} credit usage records after filtering.", creditUsages.Count);

            // Load all credit plan definitions from DB (used to match service type details)
            var creditPlans = await _unitOfWork.CreditPlanRepo.GetAllAsync().ToListAsync();

            // Build the credit usage summary DTO to return
            var creditUsageDto = new CreditsUsageSummaryDto
            {
                // Summary metrics: total credits and total transactions
                UsageSummary = new UsageSummaryDto
                {
                    TotalCreditsConsumed = creditUsages.Sum(c => c.CreditsUsed),
                    TotalTransactionsCount = creditUsages.Count
                },

                // Grouped credits usage per day (for usage trends)
                CreditUsages = creditUsages
                    .GroupBy(g => g.UsedAt.Date)
                    .Select(s => new DataUsageDataPointDto
                    {
                        Date = s.Key,
                        Value = s.Sum(x => x.CreditsUsed)
                    })
                    .OrderBy(o => o.Date)
                    .ToList(),

                // Grouped transaction counts per day
                TransactionUsages = creditUsages
                    .GroupBy(g => g.UsedAt.Date)
                    .Select(s => new DataUsageDataPointDto
                    {
                        Date = s.Key,
                        Value = s.Count()
                    })
                    .OrderBy(o => o.Date)
                    .ToList(),

                // Resource-specific usage breakdown
                ResourceUsages = creditUsages
                    .GroupBy(g => g.ServiceType)
                    .Select(s =>
                    {
                        // For each group, find the associated credit plan (if any)
                        var matchingPlan = creditPlans.FirstOrDefault(f => f.ServiceType == s.Key);

                        return new ResourceUsageDetailDto
                        {
                            ServiceType = s.Key,
                            OneUnit = matchingPlan.OneUnit,
                            UnitType = matchingPlan.UnitType,
                            Credits = matchingPlan.Credits,
                            // Usage over time for that resource
                            UsageTimeline = s
                                .GroupBy(g1 => g1.UsedAt.Date)
                                .Select(s1 => new DataUsageDataPointDto
                                {
                                    Date = s1.Key,
                                    Value = s1.Sum(x => x.CreditsUsed)
                                })
                                .OrderBy(x => x.Date)
                                .ToList()
                        };
                    })
                    .ToList(),
                Users = creditUsages.Where(c => c.UsedByUser != null).GroupBy(c => c.UsedByUserId).Select(group =>
                {
                    var user = group.First().UsedByUser;
                    return new UserUsageDto
                    {
                        Username = user.UserName,
                        FirstName = user.FirstName,
                        LastName = user.LastName,
                        TransactionsCount = group.Count()
                    };
                })
                .ToList(),
                AiModels = creditUsages.Where(w => w.RefType.HasValue && w.RefType == UsageSourceTypesEnum.AIModel).GroupBy(g => g.RefId).Select(s =>
                {
                    return new AiModelUsageDto
                    {
                        ModelName = s.First().RefName,
                        UsageCount = s.Count()
                    };
                })
                    .ToList(),
                Agents = creditUsages.Where(w => w.RefType.HasValue && w.RefType == UsageSourceTypesEnum.Agent).GroupBy(g => g.RefId).Select(s =>
                {
                    return new AgentUsageDto
                    {
                        AgentName = s.First().RefName,
                        UsageCount = s.Count()
                    };
                })
                    .ToList()
            };

            // Step 5: Populate the response object with success data
            serviceResponse.Data = creditUsageDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit usage data retrieved successfully.";

            // Log success
            _logger.LogInformation("Successfully generated credit usage summary.");
        }
        catch (Exception ex)
        {
            // Log detailed error in case of failure
            _logger.LogError(ex, "An error occurred while retrieving credit usage data.");
        }

        return serviceResponse;
    }

    // Inserts a new credit usage record for a user and service type.
    public async Task<ServiceResponse<bool>> InsertCreditUsageAsync(CreditsUsageDto creditUsageDto)
    {
        // Initialize the default service response in case of failure
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to insert credit usage. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating credit usage insertion for User ID: {UserId}, Service Type: {ServiceType}",
                creditUsageDto.UsedByUserId, creditUsageDto.ServiceType);

            // Variable to track if there are available credits
            bool hasAvailableCredits = true;

            // Check if the tenant is non-default
            var isNonDefaultTenant = _defaultTenantConfig.TenantId != _tenantId;

            // Query the current tenant's subscription, including related plan and creator details
            var subscriptionPlan = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
                    (isNonDefaultTenant || w.CreatedByUserId == _userId) &&
                    w.IsActive &&
                    w.TenantId == _tenantId
                )
                .Include(i => i.Plan)
                .Include(i => i.CreatedByUser)
                .FirstOrDefaultAsync();

            // If no subscription plan is found, log a warning and return failure message
            if (subscriptionPlan == null)
            {
                _logger.LogWarning("No current subscription plan found for tenant ID: {TenantId}", _tenantId);
                serviceResponse.Message = "No subscription plan found for the current tenant.";
                return serviceResponse;
            }

            // Query the tenant credits that are available and belong to the current user
            var availableCredits = _unitOfWork.TenantCreditRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId &&
                    (isNonDefaultTenant || w.CreatedByUserId == _userId) &&
                    w.ExpiredOn.Date >= DateTimeOffset.UtcNow.Date &&
                    w.AvailableCredits > 0
                ).OrderByDescending(o => o.ExpiredOn);

            // If no available credits are found, log a warning and return failure message
            if (!availableCredits.Any())
            {
                _logger.LogWarning("No available credits found for TenantId: {TenantId}, UserId: {UserId}.", _tenantId, _userId);
                serviceResponse.Message = "No available credits found for the specified tenant and user.";
                return serviceResponse;
            }

            // Verify that the specified service type exists in the credit plan repository
            var existingCreditPlan = await _unitOfWork.CreditPlanRepo
                .GetByConditionAsync(w => w.ServiceType == creditUsageDto.ServiceType)
                .SingleOrDefaultAsync();

            // If the service type doesn't exist, log a warning and return failure message
            if (existingCreditPlan == null)
            {
                _logger.LogWarning("Credit plan not found for Service Type: {ServiceType}. Insertion aborted.",
                    creditUsageDto.ServiceType);
                serviceResponse.Message = "Specified service type does not exist.";
                return serviceResponse;
            }

            // Calculate how many credits are needed based on the consumed units
            TenantCredit? tenantAvailableCredit = null;
            int creditUsed = (int)Math.Ceiling((decimal)creditUsageDto.ConsumedUnit / existingCreditPlan.OneUnit) * existingCreditPlan.Credits;

            // Attempt to find the first available credit that has enough available credits to cover the usage
            tenantAvailableCredit = await availableCredits.FirstOrDefaultAsync(w => w.AvailableCredits >= creditUsed);

            // If no sufficient credits are found, get the highest available credit and log a warning
            if (tenantAvailableCredit == null)
            {
                tenantAvailableCredit = await availableCredits.OrderByDescending(o => o.AvailableCredits).FirstAsync();
                _logger.LogWarning("No available credits found for TenantId: {TenantId}, UserId: {UserId}.", _tenantId, _userId);

                // Update the service response to reflect that credits are not available
                serviceResponse.Message = "No available credits found for the specified tenant and user.";
                hasAvailableCredits = false; 
            }

            // Reduce the available credits by the amount used
            tenantAvailableCredit.AvailableCredits = tenantAvailableCredit.AvailableCredits - creditUsed;

            // Update the tenant credit record with the new available credits
            _unitOfWork.TenantCreditRepo.Update(tenantAvailableCredit);

            // Attempt to commit changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed during credit usage insertion for User ID: {UserId}, Service Type: {ServiceType}.",
                    creditUsageDto.UsedByUserId, creditUsageDto.ServiceType);
                return serviceResponse; 
            }

            // Map the DTO to the entity model and set the user ID
            var creditUsage = creditUsageDto.Adapt<CreditUsage>();
            creditUsage.CreditsUsed = creditUsed;
            creditUsage.UsedByUserId = _userId;

            // Insert the new credit usage record into the database
            await _unitOfWork.CreditUsageRepo.InsertAsync(creditUsage);

            // Commit the changes to the database again after inserting the usage record
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed during credit usage insertion for User ID: {UserId}, Service Type: {ServiceType}.",
                    creditUsageDto.UsedByUserId, creditUsageDto.ServiceType);
                return serviceResponse;
            }

            // If no available credits were found earlier, return the failure service response
            if (!hasAvailableCredits)
            {
                return serviceResponse;
            }

            // Set the service response to indicate successful credit usage insertion
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit usage recorded successfully.";

            // Log success with relevant details
            _logger.LogInformation("Credit usage successfully recorded for User ID: {UserId}, Service Type: {ServiceType}.",
                creditUsageDto.UsedByUserId, creditUsageDto.ServiceType);
        }
        catch (Exception ex)
        {
            // Log any unexpected errors during the credit usage process
            _logger.LogError(ex, "An error occurred while recording credit usage for User ID: {UserId}, Service Type: {ServiceType}.",
                creditUsageDto.UsedByUserId, creditUsageDto.ServiceType);
        }

        // Return the service response
        return serviceResponse;
    }

    // Exports credit usage data based on the provided filters into a downloadable CSV file.
    public async Task<ServiceResponse<FileStreamResult>> ExportCreditUsageAsync(ExportCreditUsageRequestDto exportCreditUsageRequestDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<FileStreamResult>
        {
            Data = null,
            Message = "Failed to export credit usage data. Please try again."
        };

        try
        {
            // Initialize base query and include related user information
            var creditUsageQuery = _unitOfWork.CreditUsageRepo
                .GetAllAsync()
                .Include(i => i.UsedByUser)
                .AsQueryable();

            // Filter by Service Types if any are specified in the request
            if (exportCreditUsageRequestDto.ServiceTypes.Any())
            {
                creditUsageQuery = creditUsageQuery
                    .Where(w => exportCreditUsageRequestDto.ServiceTypes.Contains(w.ServiceType));
            }

            // Filter by User IDs if provided (ensure UsedByUserId is not null)
            if (exportCreditUsageRequestDto.UserIds.Any())
            {
                creditUsageQuery = creditUsageQuery
                    .Where(w => w.UsedByUserId != null && exportCreditUsageRequestDto.UserIds.Contains(w.UsedByUserId.Value));
            }

            // Filter by Agent IDs if provided (ensure RefId is not null and RefType is Agent)
            if (exportCreditUsageRequestDto.AgentIds.Any())
            {
                creditUsageQuery = creditUsageQuery
                    .Where(w => w.RefId != null &&
                                w.RefType == UsageSourceTypesEnum.Agent &&
                                exportCreditUsageRequestDto.AgentIds.Contains(w.RefId.Value));
            }

            // Filter by AI Model IDs if provided (ensure RefId is not null and RefType is AIModel)
            if (exportCreditUsageRequestDto.AIModelIds.Any())
            {
                creditUsageQuery = creditUsageQuery
                    .Where(w => w.RefId != null &&
                                w.RefType == UsageSourceTypesEnum.AIModel &&
                                exportCreditUsageRequestDto.AIModelIds.Contains(w.RefId.Value));
            }

            // Filter records to include only those with UsedAt date on or after the specified start date
            if (exportCreditUsageRequestDto.StartDate.HasValue)
            {
                creditUsageQuery = creditUsageQuery
                    .Where(c => c.UsedAt.Date >= exportCreditUsageRequestDto.StartDate.Value.Date);
            }

            // Filter records to include only those with UsedAt date on or before the specified end date
            if (exportCreditUsageRequestDto.EndDate.HasValue)
            {
                creditUsageQuery = creditUsageQuery
                    .Where(c => c.UsedAt.Date <= exportCreditUsageRequestDto.EndDate.Value.Date);
            }

            // Fetch and map filtered credit usage records to DTOs for export
            var creditUsages = await creditUsageQuery
                .ProjectToType<ExportCreditUsageResponseDto>()
                .ToListAsync();

            _logger.LogInformation("Exporting {Count} credit usage record(s) based on applied filters.", creditUsages.Count);

            // Convert the retrieved data to CSV byte array for file export
            var csvBytes = CsvDataExporterUtil.ExportToCsvBytes(creditUsages);
            var stream = new MemoryStream(csvBytes);

            var fileResult = new FileStreamResult(stream, "text/csv")
            {
                FileDownloadName = $"credit-usage-{DateTime.UtcNow:dd/MM/yyyy}.csv"
            };

            serviceResponse.Data = fileResult;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit usage data exported successfully.";

            _logger.LogInformation("Credit usage export completed. File generated: {FileName}", fileResult.FileDownloadName);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while exporting credit usage data.");
        }

        return serviceResponse;
    }

    // Retrieves a summary of the user's available credits, including a monthly breakdown.
    public async Task<ServiceResponse<AvailableCreditSummaryDto>> GetAvailableCreditsAsync()
    {
        // Prepare the default service response in case of failure
        var serviceResponse = new ServiceResponse<AvailableCreditSummaryDto>
        {
            Data = null,
            Message = "Unable to retrieve available credits at this time. Please try again later."
        };

        try
        {
            // Log the beginning of the operation for audit/debugging purposes
            _logger.LogInformation("Fetching available credits for user: {UserId}", _userId);

            var isNonDefaultTenant = _defaultTenantConfig.TenantId != _tenantId;

            // Query the tenant credits that are available and belong to the current user
            var availableCreditsQuery = _unitOfWork.TenantCreditRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId &&
                    (isNonDefaultTenant || w.CreatedByUserId == _userId) &&
                    w.AvailableCredits > 0
                );


            // Build the DTO from the filtered credit records
            var availableCreditDto = new AvailableCreditSummaryDto
            {
                AvailableCredits = availableCreditsQuery.Sum(s => s.AvailableCredits),
                MonthlyCredits = await availableCreditsQuery.Select(s => new MonthlyCreditDetailsDto
                {
                    AvailableCredits = s.AvailableCredits,
                    ExpiredOn = s.ExpiredOn
                }).ToListAsync()
            };

            // Populate the response with success data
            serviceResponse.Data = availableCreditDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Available credits retrieved successfully.";

            // Log successful completion
            _logger.LogInformation("Available credit summary retrieved successfully for user: {UserId}", _userId);
        }
        catch (Exception ex)
        {
            // Log the error with full context
            _logger.LogError(ex, "Error occurred while retrieving available credits for user: {UserId}", _userId);
        }

        return serviceResponse;
    }
}
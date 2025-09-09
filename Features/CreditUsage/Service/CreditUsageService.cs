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
            // Log the attempt to insert credit usage
            _logger.LogInformation("Initiating credit usage insertion for User ID: {UserId}, Service Type: {ServiceType}",
                creditUsageDto.UsedByUserId, creditUsageDto.ServiceType);

            // Verify that the specified service type exists in the credit plan repository
            var existingCreditPlan = await _unitOfWork.CreditPlanRepo
                .GetByConditionAsync(w => w.ServiceType == creditUsageDto.ServiceType)
                .SingleOrDefaultAsync();

            if (existingCreditPlan == null)
            {
                _logger.LogWarning("Credit plan not found for Service Type: {ServiceType}. Insertion aborted.",
                    creditUsageDto.ServiceType);
                serviceResponse.Message = "Specified service type does not exist.";
                return serviceResponse;
            }

            int creditUsed = (int)Math.Ceiling((decimal)creditUsageDto.ConsumedUnit / existingCreditPlan.OneUnit) * existingCreditPlan.Credits;

            // // Determine credit usage based on the unit type defined in the credit plan
            // if (existingCreditPlan.UnitType == UnitTypesEnum.Credit)
            //     // If unit type is 'Credit', use the consumed units directly
            //     creditUsed = creditUsageDto.ConsumedUnit;

            // if (existingCreditPlan.UnitType == UnitTypesEnum.Transactions)
            //     // If unit type is 'Transactions', use the consumed units directly
            //     creditUsed = creditUsageDto.ConsumedUnit;

            // if (existingCreditPlan.UnitType == UnitTypesEnum.Message)
            //     // If unit type is 'Message', use the consumed units directly
            //     creditUsed = creditUsageDto.ConsumedUnit;

            // if (existingCreditPlan.UnitType == UnitTypesEnum.Seconds)
            //     // If unit type is 'Seconds', calculate credits based on configured unit and credit values
            //     // Formula: ceil(seconds / OneUnit) * Credits
            //     creditUsed = (int)Math.Ceiling((decimal)creditUsageDto.ConsumedUnit / existingCreditPlan.OneUnit)
            //                  * existingCreditPlan.Credits;

            // if (existingCreditPlan.UnitType == UnitTypesEnum.Tokens)
            //     // If unit type is 'Tokens', calculate credits based on configured unit and credit values
            //     // Formula: ceil(tokens / OneUnit) * Credits
            //     creditUsed = (int)Math.Ceiling((decimal)creditUsageDto.ConsumedUnit / existingCreditPlan.OneUnit)
            //                  * existingCreditPlan.Credits;

            // Adapt DTO to entity and assign current user ID
            var creditUsage = creditUsageDto.Adapt<CreditUsage>();
            creditUsage.CreditsUsed = creditUsed;
            creditUsage.UsedByUserId = _userId;

            // Insert the new usage record
            await _unitOfWork.CreditUsageRepo.InsertAsync(creditUsage);

            // Commit changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed during credit usage insertion for User ID: {UserId}, Service Type: {ServiceType}.",
                    creditUsageDto.UsedByUserId, creditUsageDto.ServiceType);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit usage recorded successfully.";

            // Log success
            _logger.LogInformation("Credit usage successfully recorded for User ID: {UserId}, Service Type: {ServiceType}.",
                creditUsageDto.UsedByUserId, creditUsageDto.ServiceType);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while recording credit usage for User ID: {UserId}, Service Type: {ServiceType}.",
                creditUsageDto.UsedByUserId, creditUsageDto.ServiceType);
        }

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
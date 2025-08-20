namespace AccountsAPIs.Services;

public class CreditUsageService : ICreditUsageService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreditUsageService> _logger;
    private readonly Guid _userId;

    public CreditUsageService(IUnitOfWork unitOfWork, ILogger<CreditUsageService> logger, IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;

        // Extract user ID from JWT token in the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
    }

    // Retrieves the credit usage for a given user or service.
    public async Task<ServiceResponse<CreditsUsageSummaryDto>> GetCreditUsageAsync(
    CreditServiceTypesEnum? creditServiceType,
    DateTime? startDate,
    DateTime? endDate)
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
            _logger.LogInformation("Starting credit usage fetch. Filters - ServiceType: {ServiceType}, StartDate: {Start}, EndDate: {End}",
                creditServiceType, startDate, endDate);

            // Build the query for CreditUsage with optional filters
            var creditUsageQuery = _unitOfWork.CreditUsageRepo
                    .GetAllAsync()
                    .Include(i => i.UsedByUser)
                    .AsQueryable();

            // Filter by service type if specified
            if (creditServiceType.HasValue)
                creditUsageQuery = creditUsageQuery.Where(c => c.ServiceType == creditServiceType);

            // Filter by start date if specified (records from this date forward)
            if (startDate.HasValue)
                creditUsageQuery = creditUsageQuery.Where(c => c.UsedAt.Date >= startDate.Value.Date);

            // Filter by end date if specified (records up to this date)
            if (endDate.HasValue)
                creditUsageQuery = creditUsageQuery.Where(c => c.UsedAt.Date >= endDate.Value.Date);

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
                    .Select(s => new CreditUsageDataPointDto
                    {
                        Timestamp = s.Key,
                        CreditsUsed = s.Sum(x => x.CreditsUsed)
                    })
                    .OrderBy(o => o.Timestamp)
                    .ToList(),

                // Grouped transaction counts per day
                TransactionUsages = creditUsages
                    .GroupBy(g => g.UsedAt.Date)
                    .Select(s => new TransactionUsageDataPointDto
                    {
                        Timestamp = s.Key,
                        TransactionsCount = s.Count()
                    })
                    .OrderBy(o => o.Timestamp)
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
                            ResourceName = s.Key.ToString(),
                            CreditCostPerUnit = matchingPlan?.OneUnit ?? 0,
                            MeasurementUnit = matchingPlan?.UnitType.ToString() ?? "N/A",

                            // Usage over time for that resource
                            UsageTimeline = s
                                .GroupBy(g1 => g1.UsedAt.Date)
                                .Select(s1 => new ResourceUsageDataPointDto
                                {
                                    Timestamp = s1.Key,
                                    UsageValue = s1.Sum(x => x.CreditsUsed)
                                })
                                .OrderBy(x => x.Timestamp)
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

            // Adapt DTO to entity and assign current user ID
            var creditUsage = creditUsageDto.Adapt<CreditUsage>();
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

    // Exports credit usage data for a given user/service into a CSV file.
    public async Task<ServiceResponse<FileStreamResult>> ExportCreditUsageAsync(
        CreditServiceTypesEnum? creditServiceType,
        DateTime? startDate,
        DateTime? endDate)
    {
        var serviceResponse = new ServiceResponse<FileStreamResult>
        {
            Data = null,
            Message = "Failed to export credit usage data. Please try again."
        };

        try
        {
            _logger.LogInformation("Exporting credit usage. Filters - ServiceType: {ServiceType}, StartDate: {Start}, EndDate: {End}",
                creditServiceType, startDate, endDate);

            // Prepare credit usage query with optional filters
            var creditUsageQuery = _unitOfWork.CreditUsageRepo
                .GetAllAsync()
                .Include(i => i.UsedByUser)
                .AsQueryable();

            if (creditServiceType.HasValue)
                creditUsageQuery = creditUsageQuery.Where(c => c.ServiceType == creditServiceType);

            if (startDate.HasValue)
                creditUsageQuery = creditUsageQuery.Where(c => c.UsedAt.Date >= startDate.Value.Date);

            if (endDate.HasValue)
                creditUsageQuery = creditUsageQuery.Where(c => c.UsedAt.Date <= endDate.Value.Date);

            // Project to DTOs for export
            var creditUsages = await creditUsageQuery
                .ProjectToType<CreditsUsageDto>()
                .ToListAsync();

            _logger.LogInformation("Retrieved {Count} credit usage records for export.", creditUsages.Count);

            // Convert data to CSV byte stream
            var csvBytes = CsvDataExporterUtil.ExportToCsvBytes(creditUsages);

            var stream = new MemoryStream(csvBytes);
            var fileResult = new FileStreamResult(stream, "text/csv")
            {
                FileDownloadName = $"credit-usage-{DateTime.UtcNow:yyyyMMddHHmmss}.csv"
            };

            serviceResponse.Data = fileResult;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit usage data exported successfully.";

            _logger.LogInformation("Credit usage export completed successfully.");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred during credit usage export.");
        }

        return serviceResponse;
    }
}
namespace AccountsAPIs.Services;

public class CreditUsageService : ICreditUsageService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreditUsageService> _logger;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public CreditUsageService(
        IUnitOfWork unitOfWork,
        ILogger<CreditUsageService> logger,
        IHttpContextAccessor httpContextAccessor,
        EnvironmentConfig environmentConfig)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;

        // Extract user ID from JWT token in the HTTP context
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Extract tenant ID from JWT token claims
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        _environmentConfig = environmentConfig;
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
            if (!startDate.HasValue || !endDate.HasValue)
            {
                startDate = DateTime.UtcNow.Date.AddDays(-6);
                endDate = DateTime.UtcNow.Date;
            }

            var tenant = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.Id == _tenantId).FirstOrDefaultAsync();

            // If no tenant is found, log a warning and return failure message
            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found with ID: {TenantId}", _tenantId);
                serviceResponse.Message = "Tenant not found.";
                return serviceResponse;
            }
            // Log the incoming request and filters for traceability
            _logger.LogInformation("Starting credit usage fetch. Filters - StartDate: {Start}, EndDate: {End}",
                startDate, endDate);

            // Build the query for CreditUsage with optional filters
            var creditUsageQuery = _unitOfWork.CreditUsageRepo
                    .GetByConditionAsync(w =>
                        w.UsedAt.Date >= startDate.Value && w.UsedAt.Date <= endDate.Value
                    )
                    .Include(i => i.UsedByUser)
                    .AsQueryable();

            // Execute the query and retrieve filtered credit usage data
            var creditUsages = await creditUsageQuery.ToListAsync();
            _logger.LogInformation("Fetched {Count} credit usage records after filtering.", creditUsages.Count);

            // Load all credit plan definitions from DB (used to match service type details)
            var creditPlans = await _unitOfWork.CreditPlanRepo.GetAllAsync().Select(s => new
            {
                ServiceType = s.ServiceType,
                UnitType = s.UnitType,
                OneUnit = s.OneUnit,
                Credits = tenant.Discount.HasValue ? s.Credits * tenant.Discount.Value : s.Credits
            }).ToListAsync();

            // Generate a sequence of all dates in the requested range.
            // var totalDays = (endDate.Value - startDate.Value).Days + 1;
            var allDatesInRange = Enumerable.Range(0, (endDate.Value - startDate.Value).Days + 1)
                                            .Select(s => startDate.Value.AddDays(s));

            // Build the credit usage summary DTO to return
            var creditUsageDto = new CreditsUsageSummaryDto
            {
                // Summary metrics: total credits and total transactions
                UsageSummary = new UsageSummaryDto
                {
                    TotalCredits = creditUsages.Sum(c => c.CreditsUsed),
                    TotalAgentTransactions = creditUsages
                            .Where(w => w.ServiceType == CreditServiceTypesEnum.AgentExecutionTime && !string.IsNullOrEmpty(w.TriggeredByAgent))
                            .Count(),
                    TotalAgentCredits = creditUsages
                            .Where(w => !string.IsNullOrEmpty(w.TriggeredByAgent))
                            .GroupBy(g => g.TriggeredByAgent)
                            .Sum(sm => sm.Sum(sum => sum.CreditsUsed)),
                },

                // Grouped credits usage per day (for usage trends)
                CreditUsages = allDatesInRange
                    .Select(s => new DataUsageDataPointDto
                    {
                        Date = s,
                        TotalCount = creditUsages.Where(w => w.UsedAt.Date == s).Sum(sm => sm.CreditsUsed),
                    })
                    .OrderBy(o => o.Date)
                    .ToList(),

                // Grouped transaction counts per day
                AgentTransactionUsages = allDatesInRange
                    .Select(s => new DataUsageDataPointDto
                    {
                        Date = s,
                        TotalCount = creditUsages
                            .Where(w =>
                                w.UsedAt.Date == s &&
                                w.ServiceType == CreditServiceTypesEnum.AgentExecutionTime &&
                                !string.IsNullOrEmpty(w.TriggeredByAgent))
                            .Count()
                    })
                    .OrderBy(o => o.Date)
                    .ToList(),

                AgentCreditUsages = allDatesInRange
                    .Select(s => new DataUsageDataPointDto
                    {
                        Date = s,
                        TotalCount = creditUsages
                            .Where(w => w.UsedAt.Date == s && !string.IsNullOrEmpty(w.TriggeredByAgent))
                            .GroupBy(g => g.TriggeredByAgent)
                            .Sum(sm => sm.Sum(sum => sum.CreditsUsed)),
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
                            // TODO: credits/unit infor by default is disabled for all tenants. However, We should be able to enable it to specific tenants in the future if needed so only specified tenant can see these details
                            // We'll keep these 3 fields nullable and will only set values if the tenant has enabled credits/unit information in the future. Frontend can use the presence of values in these fields to decide whether to show credits/unit details or not.
                            //OneUnit = matchingPlan.OneUnit,
                            //UnitType = matchingPlan.UnitType,
                            //Credits = matchingPlan.Credits,
                            TotalCredits = s.Sum(sm => sm.CreditsUsed),
                            TotalTransactions = s.Count(),
                            UsageTimeline = s
                                .GroupBy(g1 => g1.UsedAt.Date)
                                .Select(s1 => new DataUsageDataPointDto
                                {
                                    Date = s1.Key,
                                    TotalCount = s1.Sum(x => x.CreditsUsed),
                                })
                                .OrderBy(o => o.Date)
                                .ToList()
                        };
                    })
                    .ToList(),
                Users = creditUsages
                    .Where(w =>
                        w.UsedByUser != null &&
                        w.RefId != null
                    )
                    .GroupBy(g => g.UsedByUserId).Select(s =>
                    {
                        var user = s.First().UsedByUser;
                        return new UserUsageDto
                        {
                            Username = user.UserName,
                            FirstName = user.FirstName,
                            LastName = user.LastName,
                            TotalTransactions = creditUsages
                                .Where(w =>
                                    w.UsedByUserId == user.Id &&
                                    (
                                        w.ServiceType == CreditServiceTypesEnum.AIModelExecutionTime ||
                                        w.ServiceType == CreditServiceTypesEnum.AgentExecutionTime
                                    )
                                ).Count(),
                            TotalCredits = s.Sum(sm => sm.CreditsUsed)
                        };
                    })
                    .ToList(),
                AiModels = creditUsages
                    .Where(w => w.RefId != null && w.RefType == UsageSourceTypesEnum.AIModel)
                    .GroupBy(g => g.RefId).Select(s =>
                    {
                        return new AiModelUsageDto
                        {
                            ModelName = s.First().RefName,
                            TotalTransactions = creditUsages.Where(w => w.ServiceType == CreditServiceTypesEnum.AIModelExecutionTime && w.RefType == UsageSourceTypesEnum.AIModel && w.RefId == s.First().RefId).Count(),
                            TotalCredits = s.Sum(sm => sm.CreditsUsed)
                        };
                    })
                    .ToList(),
                Agents = creditUsages
                    .Where(w =>
                        w.RefId != null &&
                        w.RefType == UsageSourceTypesEnum.Agent &&
                        !string.IsNullOrEmpty(w.TriggeredByAgent)
                    )
                    .GroupBy(g => g.RefId).Select(s =>
                    {
                        return new AgentUsageDto
                        {
                            AgentName = s.First().RefName,
                            TotalTransactions = creditUsages.Where(w => w.ServiceType == CreditServiceTypesEnum.AgentExecutionTime && w.RefType == UsageSourceTypesEnum.Agent && w.RefId == s.First().RefId).Count(),
                            TotalCredits = s.Sum(sm => sm.CreditsUsed)
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

    // Record a new credit usage record for a user and service type.
    public async Task<ServiceResponse<bool>> RecordCreditUsageAsync(CreditsUsageDto creditUsageDto)
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

            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(w => w.Id == _tenantId)
                .FirstOrDefaultAsync();

            // If no tenant is found, log a warning and return failure message
            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found with ID: {TenantId}", _tenantId);
                serviceResponse.Message = "Tenant not found.";
                return serviceResponse;
            }

            // Query the current tenant's subscription, including related plan and creator details
            var subscriptionPlan = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
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
                    w.AvailableCredits > 0 &&
                    w.ExpiredOn.Date > DateTimeOffset.UtcNow.Date
                ).OrderBy(o => o.ExpiredOn);

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

            double creditUsed = 0;
            if (_environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Commercial.ToString())
            {
                // Calculate how many credits are needed based on the consumed units
                TenantCredit? tenantAvailableCredit = null;

                // Round up the consumed units to the nearest whole number
                creditUsageDto.ConsumedUnit = Math.Ceiling(creditUsageDto.ConsumedUnit);

                // Calculate the credit used based on the consumed units, the credit plan's unit value, and the number of credits per unit
                creditUsed = creditUsageDto.ConsumedUnit / existingCreditPlan.OneUnit * existingCreditPlan.Credits;

                // Apply the tenant's discount to creditUsed if it exists; otherwise, leave it unchanged.
                creditUsed = tenant.Discount.HasValue ? creditUsed * tenant.Discount.Value : creditUsed;

                // Attempt to find the first available credit that has enough available credits to cover the usage
                tenantAvailableCredit = await availableCredits
                    .FirstOrDefaultAsync(w => w.AvailableCredits > 0 && w.AvailableCredits >= creditUsed);

                // If no sufficient credits are found, get the highest available credit and log a warning
                if (tenantAvailableCredit == null)
                {
                    tenantAvailableCredit = await availableCredits.OrderByDescending(o => o.AvailableCredits).FirstAsync();
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
            }

            // Map the DTO to the entity model and set the user ID
            var creditUsage = creditUsageDto.Adapt<CreditUsage>();
            creditUsage.CreditsUsed = creditUsed;
            creditUsage.UnitUsed = creditUsageDto.ConsumedUnit;
            creditUsage.UsedByUserId = creditUsageDto.UsedByUserId.HasValue ? creditUsageDto.UsedByUserId : _userId;

            // Insert the new credit usage record into the database
            await _unitOfWork.CreditUsageRepo.InsertAsync(creditUsage);

            // Commit the changes to the database again after inserting the usage record
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed during credit usage insertion for User ID: {UserId}, Service Type: {ServiceType}.",
                    creditUsageDto.UsedByUserId, creditUsageDto.ServiceType);
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

    public async Task<ServiceResponse<bool>> RecordCreditUsagesAsync(IEnumerable<CreditsUsageDto> creditUsageDtos)
    {
        // Initialize the default service response for multiple credit usage insertions
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to insert credit usage records. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating multiple credit usage insertions for {Count} records.", creditUsageDtos.Count());

            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(w => w.Id == _tenantId)
                .FirstOrDefaultAsync();

            // If no tenant is found, log a warning and return failure message
            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found with ID: {TenantId}", _tenantId);
                serviceResponse.Message = "Tenant not found.";
                return serviceResponse;
            }

            // Query the current tenant's subscription, including related plan and creator details
            var subscriptionPlan = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w =>
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
            var availableCredits = await _unitOfWork.TenantCreditRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId &&
                    w.AvailableCredits > 0 &&
                    w.ExpiredOn.Date > DateTimeOffset.UtcNow.Date
                ).OrderBy(o => o.ExpiredOn)
                .ToListAsync();

            // If no available credits are found, log a warning and return failure message
            if (!availableCredits.Any())
            {
                _logger.LogWarning("No available credits found for TenantId: {TenantId}, UserId: {UserId}.", _tenantId, _userId);
                serviceResponse.Message = "No available credits found for the specified tenant and user.";
                return serviceResponse;
            }

            // Verify that the service types exist in the credit plan repository
            var existingCreditPlans = await _unitOfWork.CreditPlanRepo
                .GetByConditionAsync(w => creditUsageDtos.Select(d => d.ServiceType).Contains(w.ServiceType))
                .ToListAsync();

            // Check if any service type in creditUsageDtos doesn't exist in existingCreditPlans
            if (creditUsageDtos.Any(a => !existingCreditPlans.Any(a2 => a2.ServiceType.ToString() == a.ServiceType.ToString())))
            {
                _logger.LogWarning("Some service types do not exist. Insertion aborted.");
                serviceResponse.Message = "Some service types do not exist.";
                return serviceResponse;
            }

            // Initialize a list to collect credit usage records
            var creditUsages = new List<CreditUsage>();

            // Process each credit usage
            foreach (var creditUsageDto in creditUsageDtos)
            {
                double creditUsed = 0;
                if (_environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Commercial.ToString())
                {
                    // Calculate how many credits are needed based on the consumed units
                    var creditPlan = existingCreditPlans.FirstOrDefault(p => p.ServiceType == creditUsageDto.ServiceType);

                    // Round up the consumed units to the nearest whole number
                    creditUsageDto.ConsumedUnit = Math.Ceiling(creditUsageDto.ConsumedUnit);

                    // Calculate the credit used based on the consumed units, the credit plan's unit value, and the number of credits per unit
                    creditUsed = creditUsageDto.ConsumedUnit / creditPlan.OneUnit * creditPlan.Credits;

                    // Apply the tenant's discount to creditUsed if it exists; otherwise, leave it unchanged.
                    creditUsed = tenant.Discount.HasValue ? creditUsed * tenant.Discount.Value : creditUsed;

                    // Attempt to find the first available credit that has enough available credits to cover the usage
                    var tenantAvailableCredit = availableCredits.FirstOrDefault(w => w.AvailableCredits >= creditUsed);

                    // If no sufficient credits are found, get the highest available credit and log a warning
                    if (tenantAvailableCredit == null)
                    {
                        tenantAvailableCredit = availableCredits.OrderByDescending(o => o.AvailableCredits).FirstOrDefault();
                    }

                    // Reduce the available credits by the amount used
                    tenantAvailableCredit.AvailableCredits -= creditUsed;

                    // Update the tenant credit record with the new available credits
                    _unitOfWork.TenantCreditRepo.Update(tenantAvailableCredit);
                }

                // Map the DTO to the entity model and set the user ID
                var creditUsage = creditUsageDto.Adapt<CreditUsage>();
                creditUsage.CreditsUsed = creditUsed;
                creditUsage.UnitUsed = creditUsageDto.ConsumedUnit;
                creditUsage.UsedByUserId = creditUsageDto.UsedByUserId.HasValue ? creditUsageDto.UsedByUserId : _userId;

                // Add the credit usage to the list for batch insertion
                creditUsages.Add(creditUsage);
            }

            // Insert the new credit usage records into the database
            await _unitOfWork.CreditUsageRepo.InsertAsync(creditUsages);

            // Commit the changes to the database after processing all records
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed during credit usage insertion for User ID: {UserId}.", _userId);
                return serviceResponse;
            }

            // Set the service response to indicate successful credit usage insertion
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit usage records recorded successfully.";

            // Log success with relevant details
            _logger.LogInformation("{Count} credit usage records successfully recorded for TenantId: {TenantId}.", creditUsageDtos.Count(), _tenantId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while recording multiple credit usages for TenantId: {TenantId}.", _tenantId);
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
            // Check if the StartDate or EndDate are not provided (null)
            if (!exportCreditUsageRequestDto.StartDate.HasValue || !exportCreditUsageRequestDto.EndDate.HasValue)
            {
                // If dates are missing, set default values: 
                // - StartDate is 6 days before today
                // - EndDate is today
                exportCreditUsageRequestDto.EndDate = DateTime.UtcNow.Date;
                exportCreditUsageRequestDto.StartDate = DateTime.UtcNow.Date.AddDays(-6);
            }

            // Fetch the tenant details from the repository based on the TenantId
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(w => w.Id == _tenantId)
                .FirstOrDefaultAsync();

            // If no tenant is found, log a warning and return failure message
            if (tenant == null)
            {
                _logger.LogWarning("Tenant not found with ID: {TenantId}", _tenantId);
                serviceResponse.Message = "Tenant not found.";
                return serviceResponse;
            }

            // Initialize base query and include related user information
            var creditUsageQuery = _unitOfWork.CreditUsageRepo
                .GetByConditionAsync(w =>
                        w.UsedAt.Date >= exportCreditUsageRequestDto.StartDate && w.UsedAt.Date <= exportCreditUsageRequestDto.EndDate
                )
                .Include(i => i.UsedByUser)
                .OrderByDescending(o => o.UsedAt)
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

            // Log the count of credit usage records being exported
            _logger.LogInformation("Exporting {Count} credit usage record(s) based on applied filters.", creditUsages.Count);

            // Load all credit plan definitions from DB (used to match service type details)
            var creditPlans = await _unitOfWork.CreditPlanRepo.GetAllAsync().Select(s => new
            {
                ServiceType = s.ServiceType,
                UnitType = s.UnitType,
                OneUnit = s.OneUnit,
                Credits = tenant.Discount.HasValue ? s.Credits * tenant.Discount.Value : s.Credits
            }).ToListAsync();

            // Map the correct UnitType from credit plans to each credit usage record
            creditUsages.ForEach(f =>
            {
                // Find the matching credit plan based on the ServiceType and assign its UnitType to the credit usage
                f.UnitType = creditPlans.FirstOrDefault(plan => plan.ServiceType == f.ServiceType)?.UnitType;
            });

            // Convert the retrieved data to CSV byte array for file export
            var csvBytes = CsvDataExporterUtil.ExportToCsvBytes(creditUsages, new List<string>
            {
                "Date",
                "Service",
                "Service Unit",
                "Unit Consumed",
                "Credits Used",
                "Type",
                "Agent/AI Model",
                "User",
                "Action",
                "Triggered By"
            });
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

    // Retrieves the user's available credit balance.
    public async Task<ServiceResponse<AvailableCreditDto>> GetAvailableCreditsAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AvailableCreditDto>
        {
            Data = null,
            Message = "Unable to retrieve available credits. Please try again later."
        };

        try
        {
            // Check if authentication-related operations are globally disabled.
            // This can be due to maintenance, security incidents, or temporary administrative restrictions.
            if (_environmentConfig.OnPremLoginDisabled)
            {
                serviceResponse.StatusCode = 403;
                serviceResponse.Message = "Authentication is currently disabled. Please contact Aventisia Support for assistance.";
                return serviceResponse;
            }

            // Log the start of the credit retrieval process
            _logger.LogInformation("Starting credit retrieval for user: {UserId}", _userId);

            // Handle credit retrieval for Commercial tenants
            if (_environmentConfig.OnPremTenantType == OnPremTenantTypesEnum.Commercial.ToString())
            {
                // Fetch available tenant credits for the current user
                var availableCreditsQuery = _unitOfWork.TenantCreditRepo
                    .GetByConditionAsync(w =>
                        w.TenantId == _tenantId &&
                        w.ExpiredOn.Date > DateTimeOffset.UtcNow.Date
                    );

                // Aggregate available credit data into the DTO
                serviceResponse.Data = new AvailableCreditDto
                {
                    AvailableCredits = await availableCreditsQuery.SumAsync(s => s.AvailableCredits),
                };
            }
            else
            {
                // For non-commercial tenants, set available credits to a very high value (e.g., unlimited)
                serviceResponse.Data = new AvailableCreditDto
                {
                    AvailableCredits = int.MaxValue
                };
            }

            // Update response with successful data
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Available credits fetched successfully.";

            _logger.LogInformation("Credit balance successfully retrieved for user: {UserId}", _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving credit balance for user: {UserId}", _userId);
        }

        return serviceResponse;
    }

    // Retrieves the user's available credits along with a monthly breakdown.
    public async Task<ServiceResponse<AvailableCreditSummaryDto>> GetAvailableCreditsSummaryAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AvailableCreditSummaryDto>
        {
            Data = null,
            Message = "Unable to retrieve credit summary. Please try again later."
        };

        try
        {
            // Log the start of the summary retrieval process
            _logger.LogInformation("Starting credit summary retrieval for user: {UserId}", _userId);

            // Fetch available tenant credits for the current user
            var availableCreditsQuery = _unitOfWork.TenantCreditRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId &&
                    w.ExpiredOn.Date > DateTimeOffset.UtcNow.Date
                );

            // Construct the credit summary DTO with monthly breakdown
            var availableCreditDto = new AvailableCreditSummaryDto
            {
                AvailableCredits = availableCreditsQuery.Sum(s => s.AvailableCredits),
                MonthlyCredits = await availableCreditsQuery.Select(s => new MonthlyCreditDetailsDto
                {
                    AvailableCredits = s.AvailableCredits,
                    ExpiredOn = s.ExpiredOn.Date,
                    Status = s.ExpiredOn.Date < DateTimeOffset.UtcNow.Date
                        ? CreditStatusesEnum.Expired
                        : (s.AvailableCredits <= 0
                            ? CreditStatusesEnum.Used
                            : CreditStatusesEnum.Available)
                }).ToListAsync()
            };

            // Update response with successful data
            serviceResponse.Data = availableCreditDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Credit summary retrieved successfully.";

            _logger.LogInformation("Credit summary successfully retrieved for user: {UserId}", _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving credit summary for user: {UserId}", _userId);
        }

        return serviceResponse;
    }
}
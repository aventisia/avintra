namespace AccountsAPIs.Services;

public class TenantsTableService : ITenantsTableService
{
    private readonly ILogger<TenantsTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IAzureBlobStorageService _azureBlobStorageService;
    private readonly Guid _userId;
    private readonly string _jwt;
    private readonly EnvironmentConfig _environmentConfig;


    public TenantsTableService(
        ILogger<TenantsTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        IAzureBlobStorageService azureBlobStorageService,
        EnvironmentConfig environmentConfig)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _jwt = GetJwtOfRequestUtil.GetJwtOfRequest(httpContextAccessor.HttpContext) ?? "jwt-not-found";

        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _azureBlobStorageService = azureBlobStorageService;
        _environmentConfig = environmentConfig;
    }

    // Retrieves all tenants.
    public async Task<ServiceResponse<IEnumerable<TenantsTableDto>>> GetTenantsAsync(TenantFilterQuery tenantFilterQuery)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<TenantsTableDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // If either StartDate or EndDate is not provided, default the date range to the last 1 month (from today in UTC)
            if (!tenantFilterQuery.StartDate.HasValue || !tenantFilterQuery.EndDate.HasValue)
            {
                tenantFilterQuery.StartDate = DateTime.UtcNow.Date.AddMonths(-1);
                tenantFilterQuery.EndDate = DateTime.UtcNow.Date;
            }

            // Fetch the list of tenants 
            var tenants = await _unitOfWork.TenantRepo
                .GetByConditionAsync(w => true)
                .OrderByDescending(o => o.CreatedOn)
                .ToListAsync();

            // Extract tenantIds and userIds for use in other queries
            var tenantIds = tenants.Select(s => s.Id).ToList();
            var userIds = tenants.SelectMany(s => new[] { s.CreatedByUserId, s.LastModifiedByUserId }).Distinct().ToList();

            // Fetch data for account users, tenant subscriptions, tenant credits, and container sizes in parallel
            var accountUsers = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => w.TenantId != null && tenantIds.Contains(w.TenantId.Value))
                .ToListAsync();

            // Extract the user ids belonging to the tenants so we can look up their session activity.
            var tenantUserIds = accountUsers.Select(s => s.Id).ToList();

            // Fetch the most recent session activity (active session refresh or session
            // termination) for the tenant's users. This is used to derive the tenant's
            // "last used" date.
            var activeSessionLastUsed = await _unitOfWork.ActiveSessionRepo
                .GetByConditionAsync(w => tenantUserIds.Contains(w.UserId))
                .GroupBy(g => g.UserId)
                .Select(s => new { UserId = s.Key, LastUsed = s.Max(x => x.LastRefreshOn) })
                .ToDictionaryAsync(td => td.UserId, td => td.LastUsed);

            var sessionLogLastUsed = await _unitOfWork.SessionLogRepo
                .GetByConditionAsync(w => tenantUserIds.Contains(w.UserId))
                .GroupBy(g => g.UserId)
                .Select(s => new { UserId = s.Key, LastUsed = s.Max(x => x.SessionTerminatedOn) })
                .ToDictionaryAsync(td => td.UserId, td => td.LastUsed);

            var tenantSubscriptions = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => tenantIds.Contains(w.TenantId) && w.IsActive)
                .Include(i => i.Plan)
                .GroupBy(g => g.TenantId)
                .Select(s => s.FirstOrDefault())
                .ToDictionaryAsync(td => td.TenantId, td => td);

            var tenantCredits = await _unitOfWork.TenantCreditRepo
                .GetByConditionAsync(w => tenantIds.Contains(w.TenantId) && w.ExpiredOn.Date > DateTimeOffset.UtcNow.Date)
                .GroupBy(g => g.TenantId)
                .Select(s => new { TenantId = s.Key, TotalCredits = s.Sum(x => x.AvailableCredits) })
                .ToDictionaryAsync(td => td.TenantId, td => td.TotalCredits);

            var tenantCreditsUssages = await _unitOfWork.CreditUsageRepo
                .GetByConditionAsync(w => tenantIds.Contains(w.TenantId) && w.UsedAt.Date >= tenantFilterQuery.StartDate.Value && w.UsedAt.Date <= tenantFilterQuery.EndDate.Value)
                .GroupBy(g => g.TenantId)
                .Select(s => new { TenantId = s.Key, TotalCredits = s.Sum(x => x.CreditsUsed) })
                .ToDictionaryAsync(td => td.TenantId, td => td.TotalCredits);

            // This one is safe to run separately (not EF). Wrap it in its own try/catch so a
            // transient Azure Blob Storage failure (e.g. network issue) does not fail the whole
            // tenants list. When it fails, storage sizes simply default to 0.
            Dictionary<string, long> tenantContainerSizes;
            try
            {
                tenantContainerSizes = await _azureBlobStorageService
                    .GetAllContainersWithSizeAsync(tenants.Select(s => s.ContainerName).ToList());
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to retrieve container sizes for tenants; continuing with default sizes.");
                tenantContainerSizes = new Dictionary<string, long>();
            }

            // Create a dictionary for tenant managers' names (CreatedBy and LastModifiedBy)
            var tenantManagers = accountUsers
                .Where(w => userIds.Contains(w.Id))
                .ToDictionary(td => td.Id, td => td.FirstName + " " + td.LastName);

            // Build query string with dynamic date filters
            var url = $"{_environmentConfig.WorkspaceApiBaseUrl}/sa/tenant/summary" +
                $"?startDate={tenantFilterQuery.StartDate.Value.UtcDateTime:O}" +
                $"&endDate={tenantFilterQuery.EndDate.Value.UtcDateTime:O}";

            // Call external API with query parameters. Wrap in its own try/catch so a transient
            // failure (e.g. SSL/network issue to the Workspace API) does not fail the whole
            // tenants list. When it fails, the summary metrics simply default to 0.
            var tenantSummaries = new Dictionary<Guid, TenantTableSummaryDto>();
            try
            {
                HttpResponseMessage response = await RequestExternalAPIUtil.RequestExternalAPI(
                    CrudTypesEnum.Read,
                    url,
                    _jwt);

                // Proceed only if API call was successful (status code 2xx)
                if (response.IsSuccessStatusCode)
                {
                    // Read response content as JSON string
                    var content = await response.Content.ReadAsStringAsync();

                    // Deserialize JSON into ServiceResponse DTO (case-insensitive mapping)
                    var result = JsonSerializer.Deserialize<ServiceResponse<IEnumerable<TenantTableSummaryDto>>>(
                        content,
                        new JsonSerializerOptions { PropertyNameCaseInsensitive = true });

                    // Convert list into dictionary for faster lookup by TenantId
                    if (result?.Data != null)
                        tenantSummaries = result.Data.ToDictionary(td => td.TenantId, td => td);
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Failed to retrieve tenant job summary from Workspace API; continuing with default summary metrics.");
            }

            // Map the retrieved data into a list of TenantsTableDto objects
            var tenantsTableDtoList = tenants.Select(tenant =>
            {
                // Map tenant data to TenantsTableDto
                var tenantsTableDto = tenant.Adapt<TenantsTableDto>();

                // Retrieve related data for each tenant using TryGetValue to avoid missing data errors
                tenantManagers.TryGetValue(tenant.CreatedByUserId, out var createdBy);
                tenantManagers.TryGetValue(tenant.LastModifiedByUserId, out var modifiedBy);
                tenantSubscriptions.TryGetValue(tenant.Id, out var subscription);
                tenantCredits.TryGetValue(tenant.Id, out var credit);
                tenantContainerSizes.TryGetValue(tenant.ContainerName, out var containerSize);
                tenantCreditsUssages.TryGetValue(tenant.Id, out var creditsUsed);
                tenantSummaries.TryGetValue(tenant.Id, out var summary);

                // Assign values to the DTO properties
                tenantsTableDto.CreatedBy = createdBy;
                tenantsTableDto.LastModifiedBy = modifiedBy;
                tenantsTableDto.ActivePlan = subscription?.Plan?.Name;
                tenantsTableDto.RenewalDate = subscription?.NextBillingDate != null
                                            ? (DateTimeOffset)subscription.NextBillingDate
                                            : default;
                tenantsTableDto.AvailableCredits = (decimal)credit;
                tenantsTableDto.TotalUsers = accountUsers.Count(w => w.TenantId == tenantsTableDto.Id);
                tenantsTableDto.StorageSize = containerSize;
                tenantsTableDto.ConsumedCredits = creditsUsed;
                tenantsTableDto.TotalExecutionTime = summary?.ExecutionTime ?? 0;
                tenantsTableDto.PublishAgent = summary?.PublishAgent ?? 0;
                tenantsTableDto.TotalJobs = summary?.TotalJobs ?? 0;

                // Determine the tenant's last used date as the most recent session activity
                // (active session refresh or session termination) across all of its users.
                var tenantUserIds = accountUsers
                    .Where(w => w.TenantId == tenantsTableDto.Id)
                    .Select(w => w.Id)
                    .ToList();

                var lastUsedDates = new List<DateTimeOffset>();
                foreach (var userId in tenantUserIds)
                {
                    if (activeSessionLastUsed.TryGetValue(userId, out var activeLastUsed))
                        lastUsedDates.Add(activeLastUsed);
                    if (sessionLogLastUsed.TryGetValue(userId, out var logLastUsed))
                        lastUsedDates.Add(logLastUsed);
                }

                tenantsTableDto.LastLoginDate = lastUsedDates.Count > 0
                    ? lastUsedDates.Max()
                    : null;

                return tenantsTableDto;
            }).ToList();

            // Task successful
            serviceResponse.Data = tenantsTableDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenants retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve tenants.");
            return serviceResponse;
        }

        return serviceResponse;
    }


    // Retrieves all tenants.
    public async Task<ServiceResponse<TenantsTableDto>> GetTenantAsync(Guid? id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TenantsTableDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get tenants
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(w =>
                    w.IsEditable && !w.IsDefault && w.Id == (id ?? _currentTenantService.CurrentTenantId))
                .SingleOrDefaultAsync();

            // Get tenant manager's full name list
            var tenantManager = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w =>
                    tenant.CreatedByUserId == w.Id ||
                    tenant.LastModifiedByUserId == w.Id)
                .Select(s => new { s.Id, UserFullName = s.FirstName + " " + s.LastName })
                .SingleOrDefaultAsync();


            // Default mapping
            var tenantsTableDto = tenant.Adapt<TenantsTableDto>();

            // Get CreatedBy user full name
            tenantsTableDto.CreatedBy = tenantManager.UserFullName;

            // Get LastModifiedBy user full name
            tenantsTableDto.LastModifiedBy = tenantManager.UserFullName;

            // Task successful
            serviceResponse.Data = tenantsTableDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenants retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve tenant {TenantId}.", id);
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a list of tenant options.
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetTenantOptionListAsync(TenantTypesEnum? tenantType)
    {
        // Initialize the service response with a default null data and an error message
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
        {
            Data = null,
            Message = "Failed to retrieve tenants. Please try again."
        };

        try
        {
            // Retrieve all tenants from the repository
            var tenants = await _unitOfWork.TenantRepo.GetByConditionAsync(w => w.IsEditable && !w.IsDefault).ToListAsync();

            // If a specific tenant type is provided, filter the tenants accordingly
            if (tenantType.HasValue)
            {
                tenants = tenants.Where(a => a.Type == tenantType).ToList();
            }

            // Map the filtered tenant list to SelectOption and update the response
            serviceResponse.Data = tenants.Adapt<IEnumerable<SelectOption>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenants retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to retrieve tenant options.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a list of tenant options.
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> SearchTenantOptionListAsync(SearchSelectOptionDto searchOption)
    {
        // Initialize the service response with a default null data and an error message
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
        {
            Data = null,
            Message = "Failed to retrieve tenants. Please try again."
        };

        try
        {
            // Retrieve all tenants from the repository
            var tenants = await _unitOfWork.TenantRepo.GetByConditionAsync(t =>
            t.IsEditable && !t.IsDefault && (string.IsNullOrWhiteSpace(searchOption.UserInput) || t.Name.ToLower().Contains(searchOption.UserInput.ToLower()))).ToListAsync();

            // Map the filtered tenant list to SelectOption and update the response
            serviceResponse.Data = tenants.Adapt<IEnumerable<SelectOption>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenants retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to search tenant options.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Checks the availability of a tenant name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsTenantNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check tenant name availability. Please try again"
        };

        try
        {
            // Validate tenant uniqueness
            var tenantAlreadyExists = await _unitOfWork.TenantRepo
                                        .GetByConditionAsync(w => w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                                        .FirstOrDefaultAsync();

            // Tenant already exists
            if (tenantAlreadyExists != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A tenant with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{checkAvailabilityDto.UserInput.Trim()} tenant name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to check tenant name availability.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Inserts a new tenant.
    public async Task<ServiceResponse<TenantsTableDto>> InsertTenantAsync(TenantsTableDto tenantsTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TenantsTableDto>
        {
            Data = null,
            Message = "Failed to insert tenant. Please try again"
        };

        try
        {
            // Validate tenant uniqueness
            var tenantAlreadyExists = await _unitOfWork.TenantRepo
                                        .GetByConditionAsync(w => w.Name.ToLower() == tenantsTableDto.Name.ToLower())
                                        .FirstOrDefaultAsync();

            // Tenant already exists
            if (tenantAlreadyExists != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A tenant with same Name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto' string props
            tenantsTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(tenantsTableDto);

            // Default mapping
            var newTenant = tenantsTableDto.Adapt<Tenant>();
            newTenant.ContainerName = TenantContainerUtil.GenerateName(newTenant.Name);
            newTenant.CreatedByUserId = _userId;
            newTenant.LastModifiedByUserId = _userId;
            newTenant.IsDefault = false; // DO NOT CHANGE THIS
            newTenant.IsEditable = true; // DO NOT CHANGE THIS

            // Additional mapping
            newTenant.ExpiresOn = tenantsTableDto.ExpiresOn ?? DateTimeOffset.MaxValue; // TODO: We need to remove or update it;
            newTenant.DaysBeforePwdExpires = tenantsTableDto.DaysBeforePwdExpires ?? 730;
            newTenant.IdleSessionTimeoutMinutes = tenantsTableDto.IdleSessionTimeoutMinutes ?? 10;
            newTenant.DbOption = tenantsTableDto.DbOption ?? DatabaseOptionsEnum.Shared;
            newTenant.DbCredentials = $"User ID={tenantsTableDto.DbUserId ?? ""};Password={tenantsTableDto.DbPwd ?? ""};";
            newTenant.DbHost = $"Host={tenantsTableDto.DbHost ?? ""};Port={tenantsTableDto.DbPort ?? 0};";

            // Insert tenant
            await _unitOfWork.TenantRepo.InsertAsync(newTenant);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newTenant.Adapt<TenantsTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to insert tenant.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing tenant.
    public async Task<ServiceResponse<TenantsTableDto>> UpdateTenantAsync(TenantsTableDto tenantsTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TenantsTableDto>
        {
            Data = null,
            Message = "Failed to update tenant. Please try again"
        };

        try
        {
            // Validate tenant existence
            var tenant = await _unitOfWork.TenantRepo
                                          .GetByConditionAsync(w =>
                                            w.IsEditable == true &&
                                            w.IsDefault == false &&
                                            w.Id != _currentTenantService.CurrentTenantId &&
                                            w.Id == tenantsTableDto.Id)
                                          .SingleOrDefaultAsync();

            // Tenant does not exist
            if (tenant == null)
            {
                serviceResponse.Message = "Tenant does not exist";
                return serviceResponse;
            }

            // Validate tenant uniqueness
            var tenantAlreadyExists = await _unitOfWork.TenantRepo
                                        .GetByConditionAsync(w =>
                                            w.Name.ToLower() == tenantsTableDto.Name.ToLower() &&
                                            w.Id != tenantsTableDto.Id)
                                        .FirstOrDefaultAsync();

            // Tenant already exists
            if (tenantAlreadyExists != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A tenant with same Name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto' string props
            tenantsTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(tenantsTableDto);

            // Default mapping 
            tenantsTableDto.Adapt(tenant);
            tenant.LastModifiedByUserId = _userId;
            tenant.LastModifiedOn = DateTimeOffset.UtcNow;

            // Additional mapping
            tenant.DbCredentials = (tenantsTableDto.DbUserId != null || tenantsTableDto.DbPwd != null)
                ? $"User ID={tenantsTableDto.DbUserId};Password={tenantsTableDto.DbPwd};"
                : tenant.DbCredentials;
            tenant.DbHost = (tenantsTableDto.DbHost != null || tenantsTableDto.DbPort != null)
                ? $"Host={tenantsTableDto.DbHost};Port={tenantsTableDto.DbPort};"
                : tenant.DbHost;

            // Update tenant
            _unitOfWork.TenantRepo.Update(tenant);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = tenant.Adapt<TenantsTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to update tenant.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Disable multiple tenants by their IDs.
    public async Task<ServiceResponse<bool>> DisableTenantsAsync(List<Guid> ids)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to disable tenants. Please try again"
        };

        try
        {
            // Validate tenants existence
            var tenants = await _unitOfWork.TenantRepo
                                            .GetByConditionAsync(w =>
                                                w.IsDefault == false &&
                                                ids.Contains(w.Id))
                                            .ToListAsync();

            // Tenants do not exist
            if (tenants.Count == 0)
            {
                serviceResponse.Message = "Tenants do not exist";
                return serviceResponse;
            }

            // Disable tenants
            foreach (var tenant in tenants)
            {
                tenant.IsDisabled = true;
                tenant.LastModifiedByUserId = _userId;
                tenant.LastModifiedOn = DateTimeOffset.UtcNow;
            }

            // Update tenants
            _unitOfWork.TenantRepo.Update(tenants);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenants disabled successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to disable tenants.");
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a tenant by its ID.
    public async Task<ServiceResponse<bool>> DeleteTenantAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tenant. Please try again"
        };

        try
        {
            // Validate tenant existence
            var tenant = await _unitOfWork.TenantRepo
                                          .GetByConditionAsync(w =>
                                            w.IsEditable == true &&
                                            w.Id != _currentTenantService.CurrentTenantId &&
                                            w.Id == id)
                                          .SingleOrDefaultAsync();

            // Tenant does not exist
            if (tenant == null)
            {
                serviceResponse.Message = "Tenant does not exist";
                return serviceResponse;
            }

            // Cannot delete if its Default
            if (tenant.IsDefault)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Cannot delete system default tenant";
                return serviceResponse;
            }

            // IMPORTANT: Check if any relationship exists and abort required
            var relationshipExists = await _unitOfWork.AccountUserRepo
                                            .DoesDependentEntitiesExistAsync(w => w.TenantId == id);

            // Relationship exists
            if (relationshipExists)
            {
                serviceResponse.Message = "Cannot delete Tenant because it is linked with other records";
                return serviceResponse;
            }

            // Delete tenant
            _unitOfWork.TenantRepo.Delete(tenant);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete tenant {TenantId}.", id);
            return serviceResponse;
        }

        return serviceResponse;
    }
}

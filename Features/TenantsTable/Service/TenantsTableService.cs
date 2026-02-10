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
    public async Task<ServiceResponse<IEnumerable<TenantsTableDto>>> GetTenantsAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<TenantsTableDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get tenants
            var tenants = await _unitOfWork.TenantRepo
                .GetByConditionAsync(w =>
                    w.IsEditable && !w.IsDefault &&
                    w.Id != _currentTenantService.CurrentTenantId) //  TODO: Update condition
                .OrderByDescending(o => o.CreatedOn)
                .ToListAsync();

            // Get tenant manager's full name list
            var tenantManagers = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w =>
                    tenants.Select(s => s.CreatedByUserId).Contains(w.Id) ||
                    tenants.Select(s => s.LastModifiedByUserId).Contains(w.Id))
                .Select(s => new { s.Id, UserFullName = s.FirstName + " " + s.LastName })
                .ToListAsync();

            // Create tenantsTableDto list
            var tenantsTableDtoList = new List<TenantsTableDto>();
            foreach (var tenant in tenants)
            {
                // Default mapping
                var tenantsTableDto = tenant.Adapt<TenantsTableDto>();

                // Get CreatedBy user full name
                tenantsTableDto.CreatedBy = tenantManagers
                    .Where(w => w.Id == tenant.CreatedByUserId)
                    .Select(s => s.UserFullName)
                    .SingleOrDefault();

                // Get LastModifiedBy user full name
                tenantsTableDto.LastModifiedBy = tenantManagers
                    .Where(w => w.Id == tenant.LastModifiedByUserId)
                    .Select(s => s.UserFullName)
                    .SingleOrDefault();

                // Add tenantsTableDto to list
                tenantsTableDtoList.Add(tenantsTableDto);
            }

            // Task successful
            serviceResponse.Data = tenantsTableDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenants retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
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
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a list of tenant options.
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetTenantOptionListAsync(TenantTypesEnum? tenantType)
    {
        // Initialize the service response with a default null data and an error message
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
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

            // Map the filtered tenant list to SelectOptionDto and update the response
            serviceResponse.Data = tenants.Adapt<IEnumerable<SelectOptionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenants retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the error and return the service response with the default message
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a list of tenant options.
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> SearchTenantOptionListAsync(SearchSelectOptionDto searchOption)
    {
        // Initialize the service response with a default null data and an error message
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
        {
            Data = null,
            Message = "Failed to retrieve tenants. Please try again."
        };

        try
        {
            // Retrieve all tenants from the repository
            var tenants = await _unitOfWork.TenantRepo.GetByConditionAsync(t =>
            t.IsEditable && !t.IsDefault && (string.IsNullOrWhiteSpace(searchOption.UserInput) || t.Name.ToLower().Contains(searchOption.UserInput.ToLower()))).ToListAsync();

            // Map the filtered tenant list to SelectOptionDto and update the response
            serviceResponse.Data = tenants.Adapt<IEnumerable<SelectOptionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenants retrieved successfully.";
        }
        catch (Exception ex)
        {
            // Log the error and return the service response with the default message
            _logger.LogError(ex.ToString());
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
            _logger.LogError(ex.ToString());
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
                _logger.LogInformation($"Tenant already exists");
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
                _logger.LogInformation("Context SaveChanges failed while inserting new Tenant");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newTenant.Adapt<TenantsTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
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
                _logger.LogInformation($"Tenant does not exist");
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
                _logger.LogInformation($"Tenant already exists");
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
                _logger.LogInformation("Context SaveChanges failed while updating Tenant");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = tenant.Adapt<TenantsTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
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
                _logger.LogInformation($"Tenants do not exist");
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
                _logger.LogInformation("Context SaveChanges failed while disabling tenants");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenants disabled successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a tenant and all associated data after validation checks. Performs tenant validation (e.g., if it exists, is editable, not default, has no billing history), then attempts to delete the tenant record and all related data.
    public async Task<ServiceResponse<bool>> DeleteTenantAsync(Guid tenantId)
    {
        // Default failed serviceResponse object
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete tenant. Please try again later."
        };

        try
        {
            // Fetch tenant from repository with deletion constraints
            _logger.LogInformation($"Attempting to fetch tenant record for deletion. TenantId: {tenantId}");
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(w =>
                    w.IsEditable &&
                    w.Id != _currentTenantService.CurrentTenantId && // Exclude the current tenant from being deleted
                    w.Id == tenantId)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Check if tenant exists
            if (tenant == null)
            {
                _logger.LogInformation($"Tenant not found. TenantId: {tenantId}");
                serviceResponse.Message = "Tenant does not exist or is not eligible for deletion.";
                return serviceResponse;
            }

            // Check if tenant is a default system tenant (can't delete default tenant)
            if (tenant.IsDefault)
            {
                _logger.LogWarning($"Attempt to delete system default tenant blocked. TenantId: {tenant.Id}, Name: {tenant.Name}");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Cannot delete the system default tenant.";
                return serviceResponse;
            }

            // Check for billing history (paid tenants can't be deleted)
            var hasBillingHistory = await _unitOfWork.BillingHistoryRepo
                .GetByConditionAsync(w => w.TenantId == tenant.Id)
                .AnyAsync();

            if (hasBillingHistory)
            {
                _logger.LogWarning($"Tenant deletion blocked due to existing billing history. TenantId: {tenant.Id}");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Cannot delete a tenant with existing billing history.";
                return serviceResponse;
            }

            // Log successful validation of the tenant for deletion
            _logger.LogInformation($"Tenant validation passed. TenantId: {tenant.Id}, Name: {tenant.Name}");

            // First, delete the tenant's related data (payment history, subscriptions, etc.)
            bool deletionSuccess = await DeleteTenantRelatedDataAsync(tenant);

            if (!deletionSuccess)
            {
                _logger.LogError($"Failed to delete related data for tenant ID: {tenant.Id}");
                return serviceResponse;
            }

            // Proceed with deleting tenant record
            _logger.LogInformation($"Attempting to delete tenant record. TenantId: {tenant.Id}, Name: {tenant.Name}");
            _unitOfWork.TenantRepo.Delete(tenant);

            // Persist changes in the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"SaveChanges failed while deleting tenant record. TenantId: {tenant.Id}, Name: {tenant.Name}");
                return serviceResponse;
            }

            // Log successful deletion of tenant
            _logger.LogInformation($"Tenant successfully deleted. TenantId: {tenant.Id}, Name: {tenant.Name}");

            // Blob storage deletion
            var blobDeleted = await _azureBlobStorageService.RemoveContainerAsync(tenant.ContainerName);
            if (blobDeleted)
            {
                _logger.LogInformation($"Blob container '{tenant.ContainerName}' deleted successfully.");
            }
            else
            {
                _logger.LogError($"Failed to delete blob container '{tenant.ContainerName}' for tenant ID: {tenant.Id}");
            }

            // Update response to indicate successful deletion
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200; // Success status code
            serviceResponse.Message = "Tenant deleted successfully.";
            return serviceResponse;
        }
        catch (Exception ex)
        {
            // Catch unexpected errors and log them with detailed information
            _logger.LogError(ex, $"Unexpected error occurred while deleting tenant. TenantId: {tenantId}");
        }
        return serviceResponse;
    }

    private async Task<bool> DeleteTenantRelatedDataAsync(Tenant tenant)
    {
        // Start the deletion process and log the tenant information for tracking
        _logger.LogInformation("Starting deletion of related data for tenant ID: {TenantId}, Name: {TenantName}", tenant.Id, tenant.Name);

        try
        {
            // Define the URLs for AI_STUDIO and Workspace API endpoints
            var aiStudioApiUrl = $"{_environmentConfig.AiStudioApiBaseUrl}/api/tenant/records?tenantId={tenant.Id}";
            var worcApiUrl = $"{_environmentConfig.WorcApiBaseUrl}/api/tenant/records?tenantId={tenant.Id}";

            // Create a new HttpClient instance for making API requests
            using var httpClient = new HttpClient();

            // Helper function to send DELETE request to the specified API
            async Task<bool> CallExternalDeleteApi(string apiUrl, Guid tenantId, string tenantName)
            {
                // Prepare the DELETE request with necessary headers (Authorization & TenantId)
                using var request = new HttpRequestMessage(HttpMethod.Delete, apiUrl);
                request.Headers.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", _jwt);
                request.Headers.Add("tntid", tenantId.ToString());

                // Log the outgoing request to the external API for transparency
                _logger.LogInformation("Sending DELETE request to {ApiUrl} for tenant {TenantId}", apiUrl, tenantId);

                // Send the DELETE request and wait for the response
                var response = await httpClient.SendAsync(request);
                var content = await response.Content.ReadAsStringAsync();

                // Check if the response was successful
                if (!response.IsSuccessStatusCode)
                {
                    // Log detailed error if the request failed
                    _logger.LogError("Failed DELETE request to {ApiUrl} for tenant {TenantId}. Status: {Status}, Response: {Content}",
                        apiUrl, tenantId, response.StatusCode, content);
                    return false;  // Return false to indicate failure
                }

                // Deserialize the response content into ServiceResponse
                var apiResponse = JsonSerializer.Deserialize<ServiceResponse<bool>>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                // Check if the response was valid and contains success status
                if (apiResponse == null || !apiResponse.Data)
                {
                    // Log error with detailed message if API returned failure
                    _logger.LogError("API returned failure for tenant {TenantName}, ID: {TenantId}. Message: {Message}", tenantName, tenantId, apiResponse?.Message);
                    return false;  // Return false if the deletion failed
                }

                // Log success message after a successful deletion call
                _logger.LogInformation("Successfully deleted tenant in API {ApiUrl} for tenant {TenantId}", apiUrl, tenantId);
                return true;
            }

            // Call AI_STUDIO API for deletion
            var aiResult = await CallExternalDeleteApi(aiStudioApiUrl, tenant.Id, tenant.Name);
            if (!aiResult)
            {
                // Log failure and return early if AI_STUDIO API call failed
                _logger.LogError("AI_STUDIO API call failed for tenant {TenantId}", tenant.Id);
                return false;
            }

            // Call Workspace (Worc) API for deletion
            var worcResult = await CallExternalDeleteApi(worcApiUrl, tenant.Id, tenant.Name);
            if (!worcResult)
            {
                // Log failure and return early if Workspace API call failed
                _logger.LogError("Workspace (Worc) API call failed for tenant {TenantId}", tenant.Id);
                return false;
            }

            // After successfully deleting tenant data from external APIs, proceed with the local database cleanup.
            // --- Payment Related Records ---

            // Retrieve and delete payment history records (transactions associated with the tenant)
            var paymentHistories = await _unitOfWork.PaymentHistoryRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (paymentHistories.Any())
            {
                _logger.LogInformation($"Deleting {paymentHistories.Count} PaymentHistory records for tenant ID: {tenant.Id}");
                _unitOfWork.PaymentHistoryRepo.Delete(paymentHistories);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting PaymentHistory records.");
                    return false;
                }
            }

            // Retrieve and delete payment methods (stored payment methods for the tenant)
            var paymentMethods = await _unitOfWork.PaymentMethodRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (paymentMethods.Any())
            {
                _logger.LogInformation($"Deleting {paymentMethods.Count} PaymentMethod records for tenant ID: {tenant.Id}");
                _unitOfWork.PaymentMethodRepo.Delete(paymentMethods);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting PaymentMethod records.");
                    return false;
                }
            }

            // --- Subscription Related Records ---

            // Retrieve and delete credit usage records (how the tenant has used credits)
            var creditUsages = await _unitOfWork.CreditUsageRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (creditUsages.Any())
            {
                _logger.LogInformation($"Deleting {creditUsages.Count} CreditUsage records for tenant ID: {tenant.Id}");
                _unitOfWork.CreditUsageRepo.Delete(creditUsages);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting CreditUsage records.");
                    return false;
                }
            }

            // Retrieve and delete tenant credits (remaining credits for the tenant)
            var tenantCredits = await _unitOfWork.TenantCreditRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (tenantCredits.Any())
            {
                _logger.LogInformation($"Deleting {tenantCredits.Count} TenantCredit records for tenant ID: {tenant.Id}");
                _unitOfWork.TenantCreditRepo.Delete(tenantCredits);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting TenantCredit records.");
                    return false;
                }
            }

            // Retrieve and delete billing history records (historical billing details for the tenant)
            var billingHistories = await _unitOfWork.BillingHistoryRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (billingHistories.Any())
            {
                _logger.LogInformation($"Deleting {billingHistories.Count} BillingHistory records for tenant ID: {tenant.Id}");
                _unitOfWork.BillingHistoryRepo.Delete(billingHistories);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting BillingHistory records.");
                    return false;
                }
            }

            // Retrieve and delete billing details (billing information associated with the tenant)
            var billingDetails = await _unitOfWork.BillingDetailRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (billingDetails.Any())
            {
                _logger.LogInformation($"Deleting {billingDetails.Count} BillingDetail records for tenant ID: {tenant.Id}");
                _unitOfWork.BillingDetailRepo.Delete(billingDetails);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting BillingDetail records.");
                    return false;
                }
            }

            // Retrieve and delete tenant subscriptions (current subscriptions the tenant is active in)
            var tenantSubscriptions = await _unitOfWork.TenantSubscriptionRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (tenantSubscriptions.Any())
            {
                _logger.LogInformation($"Deleting {tenantSubscriptions.Count} TenantSubscription records for tenant ID: {tenant.Id}");
                _unitOfWork.TenantSubscriptionRepo.Delete(tenantSubscriptions);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting TenantSubscription records.");
                    return false;
                }
            }

            // --- Space and Integration Records ---

            // Retrieve and delete spaces (physical or logical spaces associated with the tenant)
            var spaces = await _unitOfWork.SpaceRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (spaces.Any())
            {
                _logger.LogInformation($"Deleting {spaces.Count} Space records for tenant ID: {tenant.Id}");
                _unitOfWork.SpaceRepo.Delete(spaces);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting Space records.");
                    return false;
                }
            }

            // Retrieve and delete app integrations (third-party integrations associated with the tenant)
            var appIntegrations = await _unitOfWork.AppIntegrationRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (appIntegrations.Any())
            {
                _logger.LogInformation($"Deleting {appIntegrations.Count} AppIntegration records for tenant ID: {tenant.Id}");
                _unitOfWork.AppIntegrationRepo.Delete(appIntegrations);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting AppIntegration records.");
                    return false;
                }
            }

            // --- Session and Log Records ---

            // Retrieve and delete session logs (logs related to tenant's active sessions)
            var sessionLogs = await _unitOfWork.SessionLogRepo.GetByConditionAsync(w => w.UserId == tenant.Id).ToListAsync();
            if (sessionLogs.Any())
            {
                _logger.LogInformation($"Deleting {sessionLogs.Count} SessionLog records for tenant ID: {tenant.Id}");
                _unitOfWork.SessionLogRepo.Delete(sessionLogs);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting SessionLog records.");
                    return false;
                }
            }

            // Retrieve and delete audit logs (audit trail related to tenant actions)
            var auditLogs = await _unitOfWork.AuditLogRepo.GetByConditionAsync(w => w.UserId == tenant.Id).ToListAsync();
            if (auditLogs.Any())
            {
                _logger.LogInformation($"Deleting {auditLogs.Count} AuditLog records for tenant ID: {tenant.Id}");
                _unitOfWork.AuditLogRepo.Delete(auditLogs);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting AuditLog records.");
                    return false;
                }
            }

            // Retrieve and delete active sessions (sessions that are currently active for the tenant)
            var activeSessions = await _unitOfWork.ActiveSessionRepo.GetByConditionAsync(w => w.UserId == tenant.Id).ToListAsync();
            if (activeSessions.Any())
            {
                _logger.LogInformation($"Deleting {activeSessions.Count} ActiveSession records for tenant ID: {tenant.Id}");
                _unitOfWork.ActiveSessionRepo.Delete(activeSessions);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting ActiveSession records.");
                    return false;
                }
            }

            // --- Roles and Permissions ---

            // Retrieve and delete account roles (roles associated with the tenant's accounts)
            var accountRoles = await _unitOfWork.AccountRoleRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (accountRoles.Any())
            {
                _logger.LogInformation($"Deleting {accountRoles.Count} AccountRole records for tenant ID: {tenant.Id}");
                _unitOfWork.AccountRoleRepo.Delete(accountRoles);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting AccountRole records.");
                    return false;
                }
            }

            // --- User and Code Records ---

            // Retrieve and delete obsolete passwords (expired or unused passwords for the tenant)
            var obsoletePwds = await _unitOfWork.ObsoletePwdRepo.GetByConditionAsync(w => w.UserId == tenant.Id).ToListAsync();
            if (obsoletePwds.Any())
            {
                _logger.LogInformation($"Deleting {obsoletePwds.Count} ObsoletePwd records for tenant ID: {tenant.Id}");
                _unitOfWork.ObsoletePwdRepo.Delete(obsoletePwds);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting ObsoletePwd records.");
                    return false;
                }
            }

            // Retrieve and delete verification codes (verification codes associated with the tenant's email)
            var verificationCodes = await _unitOfWork.VerificationCodeRepo.GetByConditionAsync(w => w.Email == tenant.Id.ToString()).ToListAsync();
            if (verificationCodes.Any())
            {
                _logger.LogInformation($"Deleting {verificationCodes.Count} VerificationCode records for tenant ID: {tenant.Id}");
                _unitOfWork.VerificationCodeRepo.Delete(verificationCodes);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Context SaveChanges failed while deleting VerificationCode records.");
                    return false;
                }
            }

            // // Retrieve and delete tenant users (users associated with the tenant)
            // var tenantUsers = await _unitOfWork.AccountUserRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            // if (tenantUsers.Any())
            // {
            //     // _logger.LogInformation($"Deleting {tenantUsers.Count} AccountUser records for tenant ID: {tenant.Id}");
            //     // _unitOfWork.AccountUserRepo.Delete(tenantUsers);
            //     // if (!await _unitOfWork.SaveAsync())
            //     // {
            //     //     _logger.LogError("Context SaveChanges failed while deleting AccountUser records.");
            //     //     return false;
            //     // }
            // }

            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error while deleting related data for tenant ID: {tenant.Id}, Exception: {ex.Message}");
            return false;
        }
    }
}
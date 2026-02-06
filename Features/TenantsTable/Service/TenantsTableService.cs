namespace AccountsAPIs.Services;

public class TenantsTableService : ITenantsTableService
{
    private readonly ILogger<TenantsTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IAzureBlobStorageService _azureBlobStorageService;
    private readonly Guid _userId;

    public TenantsTableService(
        ILogger<TenantsTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService,
        IAzureBlobStorageService azureBlobStorageService)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _currentTenantService = currentTenantService;
        _azureBlobStorageService = azureBlobStorageService;
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
                _logger.LogInformation($"Tenant does not exist");
                serviceResponse.Message = "Tenant does not exist";
                return serviceResponse;
            }

            // Cannot delete if its Default
            if (tenant.IsDefault)
            {
                _logger.LogInformation($"Cannot delete default tenant {tenant.Name}");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Cannot delete system default tenant";
                return serviceResponse;
            }
            // Check if there is any billing history associated with the tenant
            var billingHistoryExists = await _unitOfWork.BillingHistoryRepo
                .GetByConditionAsync(w => w.TenantId == tenant.Id)
                .AnyAsync();

            // If billing history exists, it means the tenant is a paid customer and cannot be deleted
            if (billingHistoryExists)
            {
                // Log a warning message indicating that the tenant has billing history and cannot be deleted
                _logger.LogWarning($"Cannot delete tenant with ID {tenant.Id}. The tenant has an active billing history and is considered a paid customer.");
                serviceResponse.Message = "Cannot delete paid tenant with existing billing history.";
            }

            _logger.LogInformation($"Checking and deleting related data for tenant ID: {tenant.Id}");

            // --- Payment Related Records ---

            // Retrieve and delete payment history records (transactions associated with the tenant)
            var paymentHistories = await _unitOfWork.PaymentHistoryRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (paymentHistories.Any())
            {
                _logger.LogInformation($"Deleting {paymentHistories.Count} PaymentHistory records for tenant ID: {tenant.Id}");
                _unitOfWork.PaymentHistoryRepo.Delete(paymentHistories);  // Deleting all related payment history records
            }

            // Retrieve and delete payment methods (stored payment methods for the tenant)
            var paymentMethods = await _unitOfWork.PaymentMethodRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (paymentMethods.Any())
            {
                _logger.LogInformation($"Deleting {paymentMethods.Count} PaymentMethod records for tenant ID: {tenant.Id}");
                _unitOfWork.PaymentMethodRepo.Delete(paymentMethods);  // Deleting all related payment method records
            }

            // --- Subscription Related Records ---

            // Retrieve and delete credit usage records (how the tenant has used credits)
            var creditUsages = await _unitOfWork.CreditUsageRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (creditUsages.Any())
            {
                _logger.LogInformation($"Deleting {creditUsages.Count} CreditUsage records for tenant ID: {tenant.Id}");
                _unitOfWork.CreditUsageRepo.Delete(creditUsages);  // Deleting all related credit usage records
            }

            // Retrieve and delete tenant credits (remaining credits for the tenant)
            var tenantCredits = await _unitOfWork.TenantCreditRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (tenantCredits.Any())
            {
                _logger.LogInformation($"Deleting {tenantCredits.Count} TenantCredit records for tenant ID: {tenant.Id}");
                _unitOfWork.TenantCreditRepo.Delete(tenantCredits);  // Deleting all related tenant credit records
            }

            // Retrieve and delete billing history records (historical billing details for the tenant)
            var billingHistories = await _unitOfWork.BillingHistoryRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (billingHistories.Any())
            {
                _logger.LogInformation($"Deleting {billingHistories.Count} BillingHistory records for tenant ID: {tenant.Id}");
                _unitOfWork.BillingHistoryRepo.Delete(billingHistories);  // Deleting all related billing history records
            }

            // Retrieve and delete billing details (billing information associated with the tenant)
            var billingDetails = await _unitOfWork.BillingDetailRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (billingDetails.Any())
            {
                _logger.LogInformation($"Deleting {billingDetails.Count} BillingDetail records for tenant ID: {tenant.Id}");
                _unitOfWork.BillingDetailRepo.Delete(billingDetails);  // Deleting all related billing details
            }

            // Retrieve and delete tenant subscriptions (current subscriptions the tenant is active in)
            var tenantSubscriptions = await _unitOfWork.TenantSubscriptionRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (tenantSubscriptions.Any())
            {
                _logger.LogInformation($"Deleting {tenantSubscriptions.Count} TenantSubscription records for tenant ID: {tenant.Id}");
                _unitOfWork.TenantSubscriptionRepo.Delete(tenantSubscriptions);  // Deleting all related tenant subscription records
            }

            // --- Space and Integration Records ---

            // Retrieve and delete spaces (physical or logical spaces associated with the tenant)
            var spaces = await _unitOfWork.SpaceRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (spaces.Any())
            {
                _logger.LogInformation($"Deleting {spaces.Count} Space records for tenant ID: {tenant.Id}");
                _unitOfWork.SpaceRepo.Delete(spaces);  // Deleting all related space records
            }

            // Retrieve and delete app integrations (third-party integrations associated with the tenant)
            var appIntegrations = await _unitOfWork.AppIntegrationRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (appIntegrations.Any())
            {
                _logger.LogInformation($"Deleting {appIntegrations.Count} AppIntegration records for tenant ID: {tenant.Id}");
                _unitOfWork.AppIntegrationRepo.Delete(appIntegrations);  // Deleting all related app integration records
            }

            // --- Session and Log Records ---

            // Retrieve and delete session logs (logs related to tenant's active sessions)
            var sessionLogs = await _unitOfWork.SessionLogRepo.GetByConditionAsync(w => w.UserId == tenant.Id).ToListAsync();
            if (sessionLogs.Any())
            {
                _logger.LogInformation($"Deleting {sessionLogs.Count} SessionLog records for tenant ID: {tenant.Id}");
                _unitOfWork.SessionLogRepo.Delete(sessionLogs);  // Deleting all related session log records
            }

            // Retrieve and delete audit logs (audit trail related to tenant actions)
            var auditLogs = await _unitOfWork.AuditLogRepo.GetByConditionAsync(w => w.UserId == tenant.Id).ToListAsync();
            if (auditLogs.Any())
            {
                _logger.LogInformation($"Deleting {auditLogs.Count} AuditLog records for tenant ID: {tenant.Id}");
                _unitOfWork.AuditLogRepo.Delete(auditLogs);  // Deleting all related audit log records
            }

            // Retrieve and delete active sessions (sessions that are currently active for the tenant)
            var activeSessions = await _unitOfWork.ActiveSessionRepo.GetByConditionAsync(w => w.UserId == tenant.Id).ToListAsync();
            if (activeSessions.Any())
            {
                _logger.LogInformation($"Deleting {activeSessions.Count} ActiveSession records for tenant ID: {tenant.Id}");
                _unitOfWork.ActiveSessionRepo.Delete(activeSessions);  // Deleting all related active session records
            }

            // --- Roles and Permissions ---

            // Retrieve and delete account roles (roles associated with the tenant's accounts)
            var accountRoles = await _unitOfWork.AccountRoleRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (accountRoles.Any())
            {
                _logger.LogInformation($"Deleting {accountRoles.Count} AccountRole records for tenant ID: {tenant.Id}");
                _unitOfWork.AccountRoleRepo.Delete(accountRoles);  // Deleting all related account role records
            }

            // --- User and Code Records ---

            // Retrieve and delete obsolete passwords (expired or unused passwords for the tenant)
            var obsoletePwds = await _unitOfWork.ObsoletePwdRepo.GetByConditionAsync(w => w.UserId == tenant.Id).ToListAsync();
            if (obsoletePwds.Any())
            {
                _logger.LogInformation($"Deleting {obsoletePwds.Count} ObsoletePwd records for tenant ID: {tenant.Id}");
                _unitOfWork.ObsoletePwdRepo.Delete(obsoletePwds);  // Deleting all related obsolete password records
            }

            // Retrieve and delete verification codes (verification codes associated with the tenant's email)
            var verificationCodes = await _unitOfWork.VerificationCodeRepo.GetByConditionAsync(w => w.Email == tenant.Id.ToString()).ToListAsync();
            if (verificationCodes.Any())
            {
                _logger.LogInformation($"Deleting {verificationCodes.Count} VerificationCode records for tenant ID: {tenant.Id}");
                _unitOfWork.VerificationCodeRepo.Delete(verificationCodes);  // Deleting all related verification code records
            }

            // Retrieve and delete tenant users (users associated with the tenant)
            var tenantUsers = await _unitOfWork.AccountUserRepo.GetByConditionAsync(w => w.TenantId == tenant.Id).ToListAsync();
            if (tenantUsers.Any())
            {
                _logger.LogInformation($"Deleting {tenantUsers.Count} AccountUser records for tenant ID: {tenant.Id}");
                _unitOfWork.AccountUserRepo.Delete(tenantUsers);  // Deleting all related tenant user records
            }

            // Attempt to delete the container asynchronously.
            if (!await _azureBlobStorageService.RemoveContainerAsync(tenant.ContainerName))
            {
                _logger.LogError($"Failed to delete blob container '{tenant.ContainerName}'.");
                _logger.LogInformation($"Tenant Info: ID={tenant.Id}, Name={tenant.Name}");
            }
            else
            {
                _logger.LogInformation($"Blob container '{tenant.ContainerName}' deleted successfully.");
            }

            // Delete tenant
            _unitOfWork.TenantRepo.Delete(tenant);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting Tenant");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant deleted successfully";
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
}
namespace AccountsAPIs.Services;

public class TenantsTableService : ITenantsTableService
{
    private readonly ILogger<TenantsTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly TenantDefaultConfig _tenantDefaultConfig;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;

    public TenantsTableService(
        ILogger<TenantsTableService> logger,
        IUnitOfWork unitOfWork,
        TenantDefaultConfig tenantDefaultConfig,
        IHttpContextAccessor httpContextAccessor,
        ICurrentTenantService currentTenantService)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _tenantDefaultConfig = tenantDefaultConfig;
        _currentTenantService = currentTenantService;
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
                    w.IsEditable == true &&
                    w.IsDefault == false &&
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
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);

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
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);

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
            newTenant.CreatedByUserId = _userId;
            newTenant.LastModifiedByUserId = _userId;
            newTenant.IsDefault = false; // DO NOT CHANGE THIS
            newTenant.IsEditable = true; // DO NOT CHANGE THIS

            // Additional mapping
            newTenant.ExpiresOn = tenantsTableDto.ExpiresOn ?? DateTimeOffset.UtcNow.AddDays(_tenantDefaultConfig.InactiveDaysBeforeDataExpires);
            newTenant.DaysBeforePwdExpires = tenantsTableDto.DaysBeforePwdExpires ?? _tenantDefaultConfig.DaysBeforePwdExpires;
            newTenant.IdleSessionTimeoutMinutes = tenantsTableDto.IdleSessionTimeoutMinutes ?? _tenantDefaultConfig.IdleSessionTimeoutInMinutes;
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
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);

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
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);

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

            // IMPORTANT: Check if any relationship exists and abort required
            var relationshipExists = await _unitOfWork.AccountUserRepo
                                            .DoesDependentEntitiesExistAsync(w => w.TenantId == id);

            // Relationship exists
            if (relationshipExists)
            {
                _logger.LogInformation($"Cannot delete Tenant because it is linked with other records");
                serviceResponse.Message = "Cannot delete Tenant because it is linked with other records";
                return serviceResponse;
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
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);

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
            _logger.LogError(ex, Constants.ERROR_OCCURRED_MESSAGE_TEMPLATE, ex.TargetSite.Name);

            return serviceResponse;
        }

        return serviceResponse;
    }
}
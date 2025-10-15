namespace AccountsAPIs.Services;

public class TenantAccountService : ITenantAccountService
{
    private readonly ILogger<TenantAccountService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public TenantAccountService(
        ILogger<TenantAccountService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // Extract user ID from JWT token claims for audit purposes
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Extract tenant ID from JWT token claims
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

    }

    // acccounts-api/tenant/user/
    // acccounts-api/tenant/users/
    // acccounts-api/tenant/add-user/
    // acccounts-api/tenant/add-users/
    // acccounts-api/tenant/update-user/
    // acccounts-api/tenant/delete-user/

    // Retrieves the organization details for the currently scoped tenant.
    public async Task<ServiceResponse<TenantOrganizationBillingDto>> GetTenantOrganizationAsync()
    {
        // Initialize default failure response
        var serviceResponse = new ServiceResponse<TenantOrganizationBillingDto>
        {
            Data = null,
            Message = "Failed to retrieve tenant organization details. Please try again."
        };

        try
        {
            _logger.LogInformation("Attempting to retrieve tenant organization for TenantId: {TenantId}", _tenantId);

            // Fetch tenant entity using TenantId
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(t => t.Id == _tenantId)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // If tenant is not found, return early with a 404 response
            if (tenant == null)
            {
                serviceResponse.Message = "Tenant organization not found.";
                _logger.LogWarning("Tenant organization not found for TenantId: {TenantId}", _tenantId);
                return serviceResponse;
            }

            // Fetch tenant and billing details concurrently
            var billingDetail = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId)
                .AsNoTracking()
                .OrderByDescending(o => o.CreatedOn)
                .FirstOrDefaultAsync();

            if (billingDetail == null)
            {
                billingDetail = new BillingDetail()
                {
                    AddressLine1 = string.Empty,
                    AddressLine2 = string.Empty,
                    City = string.Empty,
                    State = string.Empty,
                    PostalCode = string.Empty,
                    Country = CountriesEnum.India,
                    Currency = CurrencyTypesEnum.INR
                };
            }

            // Map billing details and populate response DTO
            var tenantOrganizationBillingDto = billingDetail?.Adapt<TenantOrganizationBillingDto>();
            tenantOrganizationBillingDto.OrganizationName = tenant.Name;
            tenantOrganizationBillingDto.Id = tenant.Id;

            // Populate successful response
            serviceResponse.Data = tenantOrganizationBillingDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant organization details retrieved successfully.";

            _logger.LogInformation("Successfully retrieved tenant organization for TenantId: {TenantId}", _tenantId);
        }
        catch (Exception ex)
        {
            // Log the exception
            _logger.LogError(ex, "An error occurred while retrieving tenant organization details for TenantId: {TenantId}", _tenantId);
        }

        return serviceResponse;
    }

    // Updates the organization details for the currently scoped tenant using the provided DTO.
    public async Task<ServiceResponse<TenantOrganizationBillingDto>> UpdateTenantOrganizationAsync(TenantOrganizationBillingDto organizationBillingDto)
    {
        // Initialize default failure response
        var serviceResponse = new ServiceResponse<TenantOrganizationBillingDto>
        {
            Data = null,
            Message = "Failed to update tenant organization. Please try again.",
        };

        try
        {
            _logger.LogInformation("Starting update for Tenant Organization. TenantId: {TenantId}", _tenantId);

            // Fetch tenant entity from repository
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(t => t.Id == _tenantId)
                .FirstOrDefaultAsync();

            // Null check: Tenant not found
            if (tenant == null)
            {
                serviceResponse.Message = "Tenant organization not found.";
                _logger.LogWarning("No tenant found for TenantId: {TenantId}", _tenantId);
                return serviceResponse;
            }

            _logger.LogInformation("Tenant found. Proceeding with update for TenantId: {TenantId}", _tenantId);

            // TODO: Uncomment if updating tenant name is required
            // Update tenant entity fields
            // tenant.Name = organizationBillingDto.OrganizationName;
            // tenant.LastModifiedByUserId = _userId;
            // tenant.LastModifiedOn = DateTimeOffset.UtcNow;

            // _unitOfWork.TenantRepo.Update(tenant);

            // // Save updated tenant
            // if (!await _unitOfWork.SaveAsync())
            // {
            //     _logger.LogWarning("Failed to save tenant updates for TenantId: {TenantId}", _tenantId);
            //     return serviceResponse;
            // }

            // _logger.LogInformation("Tenant update saved successfully for TenantId: {TenantId}", _tenantId);

            // Attempt to retrieve billing detail
            var billingDetail = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId)
                .OrderByDescending(o => o.CreatedOn)
                .FirstOrDefaultAsync();

            if (billingDetail == null)
            {
                // No billing detail exists - create a new one
                _logger.LogInformation("No billing detail found. Creating new billing detail for TenantId: {TenantId}", _tenantId);

                // Fetch the active tenant subscription from the repository based on TenantId
                var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                    .GetByConditionAsync(w => w.TenantId == _tenantId && w.IsActive)
                    .FirstOrDefaultAsync();

                // Check if the tenant subscription is null (i.e., no active subscription found for the tenant)
                if (tenantSubscription == null)
                {
                    // Log the warning that the tenant organization was not found
                    serviceResponse.Message = "Tenant organization not found.";
                    _logger.LogWarning("No active subscription found for TenantId: {TenantId}", _tenantId);
                }

                // Map the organization billing data to the BillingDetail object
                billingDetail = organizationBillingDto.Adapt<BillingDetail>();

                // Set necessary properties for the billing detail
                billingDetail.TenantId = _tenantId;
                billingDetail.SubscriptionId = tenantSubscription.Id;
                billingDetail.CreatedByUserId = _userId;
                billingDetail.LastModifiedByUserId = _userId;
                billingDetail.CreatedOn = DateTimeOffset.UtcNow;
                billingDetail.LastModifiedOn = DateTimeOffset.UtcNow;

                await _unitOfWork.BillingDetailRepo.InsertAsync(billingDetail);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to save new billing detail for TenantId: {TenantId}", _tenantId);
                    return serviceResponse;
                }

                _logger.LogInformation("New billing detail saved successfully for TenantId: {TenantId}", _tenantId);
            }
            else
            {
                // Billing detail exists - update it
                _logger.LogInformation("Existing billing detail found. Updating for TenantId: {TenantId}", _tenantId);

                organizationBillingDto.Adapt(billingDetail);
                billingDetail.LastModifiedByUserId = _userId;
                billingDetail.LastModifiedOn = DateTimeOffset.UtcNow;

                _unitOfWork.BillingDetailRepo.Update(billingDetail);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to save updated billing detail for TenantId: {TenantId}", _tenantId);
                    return serviceResponse;
                }

                _logger.LogInformation("Billing detail updated successfully for TenantId: {TenantId}", _tenantId);
            }

            // Map billing details and populate response DTO
            organizationBillingDto = billingDetail.Adapt<TenantOrganizationBillingDto>();
            organizationBillingDto.OrganizationName = tenant.Name;
            organizationBillingDto.Id = tenant.Id;

            serviceResponse.Data = organizationBillingDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant organization updated successfully.";

            _logger.LogInformation("Tenant organization update process completed successfully for TenantId: {TenantId}", _tenantId);
        }
        catch (Exception ex)
        {
            // Catch-all for unexpected errors
            _logger.LogError(ex, "An exception occurred while updating tenant organization for TenantId: {TenantId}", _tenantId);
        }

        return serviceResponse;
    }

    // Retrieves the tenant preferences for the currently scoped tenant.
    public async Task<ServiceResponse<TenantPreferenceDto>> GetTenantPreferencesAsync()
    {
        // Initialize response with default failure message
        var serviceResponse = new ServiceResponse<TenantPreferenceDto>
        {
            Data = null,
            Message = "Failed to retrieve tenant preferences. Please try again later."
        };

        try
        {
            _logger.LogInformation("Attempting to retrieve tenant preferences for TenantId: {TenantId}", _tenantId);

            // Attempt to retrieve tenant entity based on the tenant ID
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(t => t.Id == _tenantId)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // Null check: handle if tenant preferences are not found
            if (tenant == null)
            {
                serviceResponse.Message = "Tenant preferences not found.";
                _logger.LogWarning("Tenant preferences not found for TenantId: {TenantId}", _tenantId);
                return serviceResponse;
            }

            // Map entity to DTO
            var tenantPreferencesDto = tenant.Adapt<TenantPreferenceDto>();

            // Populate successful response
            serviceResponse.Data = tenantPreferencesDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant preferences retrieved successfully.";

            _logger.LogInformation("Successfully retrieved tenant preferences for TenantId: {TenantId}", _tenantId);
        }
        catch (Exception ex)
        {
            // Log the exception with context
            _logger.LogError(ex, "Error occurred while retrieving tenant preferences for TenantId: {TenantId}", _tenantId);
        }

        return serviceResponse;
    }

    // Updates the tenant preferences for the currently scoped tenant using the provided preferences data.
    public async Task<ServiceResponse<TenantPreferenceDto>> UpdateTenantPreferencesAsync(TenantPreferenceDto preferencesDto)
    {
        // Initialize response with default failure message
        var serviceResponse = new ServiceResponse<TenantPreferenceDto>
        {
            Data = null,
            Message = "Failed to update tenant preferences. Please try again later."
        };

        try
        {
            _logger.LogInformation("Attempting to update tenant preferences for TenantId: {TenantId}", _tenantId);

            // Retrieve tenant entity to update
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(t => t.Id == _tenantId)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // Null check: handle case where tenant is not found
            if (tenant == null)
            {
                serviceResponse.Message = "Tenant not found.";
                _logger.LogWarning("Tenant not found for update with TenantId: {TenantId}", _tenantId);
                return serviceResponse;
            }

            // Map updated values from the DTO into the existing entity
            preferencesDto.Adapt(tenant);
            tenant.LastModifiedByUserId = _userId;

            // Mark entity as updated
            _unitOfWork.TenantRepo.Update(tenant);

            // Check if save was successful
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Update failed while saving tenant preferences for TenantId: {TenantId}", _tenantId);
                return serviceResponse;
            }

            // Map updated entity back to DTO for response
            var updatedPreferencesDto = tenant.Adapt<TenantPreferenceDto>();

            // Populate success response
            serviceResponse.Data = updatedPreferencesDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant preferences updated successfully.";

            _logger.LogInformation("Successfully updated tenant preferences for TenantId: {TenantId}", _tenantId);
        }
        catch (Exception ex)
        {
            // Log the exception with context
            _logger.LogError(ex, "Error occurred while updating tenant preferences for TenantId: {TenantId}", _tenantId);
        }

        return serviceResponse;
    }
}
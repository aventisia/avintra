namespace AccountsAPIs.Services;

public class TenantAccountService : ITenantAccountService
{
    private readonly ILogger<TenantAccountService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public TenantAccountService(
        ILogger<TenantAccountService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        EnvironmentConfig environmentConfig,
        ICurrentTenantService currentTenantService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // Extract user ID from JWT token claims for audit purposes
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Extract tenant ID from JWT token claims
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        _environmentConfig = environmentConfig;
        _currentTenantService = currentTenantService;
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

        }
        catch (Exception ex)
        {
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

            // Fetch tenant entity from repository
            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(w => w.Id == _tenantId)
                .FirstOrDefaultAsync();

            // Null check: Tenant not found
            if (tenant == null)
            {
                serviceResponse.Message = "Tenant organization not found.";
                _logger.LogWarning("No tenant found for TenantId: {TenantId}", _tenantId);
                return serviceResponse;
            }


            // Fetch tenant subscription entity from repository
            var tenantSubscription = await _unitOfWork.TenantSubscriptionRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId && w.IsActive)
                .FirstOrDefaultAsync();

            // Null check: Tenant subscription not found
            if (tenantSubscription == null)
            {
                serviceResponse.Message = "Tenant subscription not found.";
                _logger.LogWarning("No tenant subscription found for TenantId: {TenantId}", _tenantId);
                return serviceResponse;
            }

            // Fetch existing billing details
            var existingBillingDetail = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId)
                .Include(i => i.BillingHistories)
                .OrderByDescending(o => o.CreatedOn)
                .FirstOrDefaultAsync();

            // Existing Billing detail is null
            if (existingBillingDetail == null)
            {
                serviceResponse.Message = "No existing billing detail found to update.";
                return serviceResponse;
            }

            // Get count of billing histories attached to the billing detail
            var billingHistoriesCount = existingBillingDetail.BillingHistories.Where(w =>
                                        w.PaymentStatus == PaymentStatusTypesEnum.Captured ||
                                        w.PaymentStatus == PaymentStatusTypesEnum.Refunded ||
                                        w.PaymentStatus == PaymentStatusTypesEnum.Failed).Count();



            // Check if billing history exists or not and decide to update or create new billing detail
            var billingDetailObjForResponse = existingBillingDetail;
            if (billingHistoriesCount == 0)
            {

                // Update existing Billing Detail
                organizationBillingDto.Adapt(existingBillingDetail);

                // Set necessary properties for the billing detail
                existingBillingDetail.SubscriptionId = tenantSubscription.Id;
                existingBillingDetail.LastModifiedByUserId = _userId;
                existingBillingDetail.LastModifiedOn = DateTimeOffset.UtcNow;

                // Update the billing detail
                _unitOfWork.BillingDetailRepo.Update(existingBillingDetail);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to update billing detail for TenantId: {TenantId}", _tenantId);
                    return serviceResponse;
                }


                // Set the response object to the updated billing detail
                billingDetailObjForResponse = existingBillingDetail;
            }
            else
            {

                // Create a new Billing Detail
                var newBillingDetail = organizationBillingDto.Adapt<BillingDetail>();

                // Set necessary properties for the billing detail
                newBillingDetail.TenantId = _tenantId;
                newBillingDetail.SubscriptionId = tenantSubscription.Id;
                newBillingDetail.CreatedByUserId = _userId;
                newBillingDetail.LastModifiedByUserId = _userId;

                // Insert new billing detail
                await _unitOfWork.BillingDetailRepo.InsertAsync(newBillingDetail);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to save new billing detail for TenantId: {TenantId}", _tenantId);
                    return serviceResponse;
                }


                // Set the response object to the newly created billing detail
                billingDetailObjForResponse = newBillingDetail;
            }

            // Map the updated or newly created billing details to the response DTO
            var organizationBillingResponseDto = billingDetailObjForResponse.Adapt<TenantOrganizationBillingDto>();
            organizationBillingResponseDto.OrganizationName = tenant.Name;
            organizationBillingResponseDto.Id = tenant.Id;

            serviceResponse.Data = organizationBillingResponseDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Tenant organization updated successfully.";

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

        }
        catch (Exception ex)
        {
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

            if (tenant.IsSSOEnabled)
            {
                // Validate that Azure Entra (Azure AD) SSO is enabled and fully configured at the environment level
                bool isAzureSsoConfigured =
                    _environmentConfig.AzureEntraIdEnabled &&
                    !string.IsNullOrWhiteSpace(_environmentConfig.AzureEntraIdClientId) &&
                    !string.IsNullOrWhiteSpace(_environmentConfig.AzureTenantId) &&
                    !string.IsNullOrWhiteSpace(_environmentConfig.AzureEntraIdClientSecret);

                // Block enabling SSO if required Azure Entra configuration is missing
                if (!isAzureSsoConfigured)
                {
                    serviceResponse.Message = "Azure SSO configuration is incomplete. Check Client ID, Tenant ID, Secret.";
                    _logger.LogWarning("SSO enablement blocked for TenantId {TenantId} due to incomplete Azure Entra configuration.", _tenantId);
                    return serviceResponse;
                }

                // Validate Azure Entra credentials by attempting token acquisition
                bool areAzureCredentialsValid = await ValidateAzureEntraCredentialsAsync();

                if (!areAzureCredentialsValid)
                {
                    serviceResponse.Message = "Azure SSO credentials are invalid or expired. Verify the secret and IDs.";
                    _logger.LogWarning("SSO enablement blocked for TenantId {TenantId} due to invalid Azure Entra credentials.", _tenantId);
                    return serviceResponse;
                }
            }

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

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating tenant preferences for TenantId: {TenantId}", _tenantId);
        }

        return serviceResponse;
    }

    /// <inheritdoc />
    public async Task<ServiceResponse<NotificationSettingsDto>> GetNotificationSettingsAsync()
    {
        var serviceResponse = new ServiceResponse<NotificationSettingsDto>
        {
            Data = null,
            Message = "Failed to retrieve notification settings. Please try again."
        };

        try
        {

            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(t => t.Id == _tenantId)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (tenant == null)
            {
                serviceResponse.Message = "Tenant not found.";
                serviceResponse.StatusCode = 404;
                _logger.LogWarning("Tenant not found for notification settings retrieval. TenantId: {TenantId}", _tenantId);
                return serviceResponse;
            }

            serviceResponse.Data = BuildNotificationSettingsDto(_tenantId, tenant.NotificationSettings);
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Notification settings retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while retrieving notification settings for TenantId: {TenantId}", _tenantId);
        }

        return serviceResponse;
    }

    /// <inheritdoc />
    public async Task<ServiceResponse<NotificationSettingsDto>> UpdateNotificationSettingsAsync(NotificationSettingsDto settingsDto)
    {
        var serviceResponse = new ServiceResponse<NotificationSettingsDto>
        {
            Data = null,
            Message = "Failed to update notification settings. Please try again."
        };

        try
        {

            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(t => t.Id == _tenantId)
                .FirstOrDefaultAsync();

            if (tenant == null)
            {
                serviceResponse.Message = "Tenant not found.";
                serviceResponse.StatusCode = 404;
                _logger.LogWarning("Tenant not found for notification settings update. TenantId: {TenantId}", _tenantId);
                return serviceResponse;
            }

            // Start from the current settings (or defaults if none stored yet).
            var settings = tenant.NotificationSettings ?? new NotificationSettings();

            // Apply the full settings object from the request.
            settings.LowCredits = settingsDto.LowCredits;
            settings.Subscription = settingsDto.Subscription;
            settings.PublishAgent = settingsDto.PublishAgent;
            settings.AgentRiskAssessmentApproval = settingsDto.AgentRiskAssessmentApproval;
            settings.SubscriptionRenewalReminderDays = settingsDto.SubscriptionRenewalReminderDays;
            settings.LowCreditThreshold = settingsDto.LowCreditThreshold;
            settings.DeliveryChannel = settingsDto.DeliveryChannel;

            // Enforce validation so invalid values (0, negative) cannot be persisted.
            var validationContext = new ValidationContext(settings);
            var validationResults = new List<ValidationResult>();
            if (!Validator.TryValidateObject(settings, validationContext, validationResults, validateAllProperties: true))
            {
                serviceResponse.Message = string.Join(" ", validationResults.Select(r => r.ErrorMessage));
                serviceResponse.StatusCode = 400;
                _logger.LogWarning("Invalid notification settings for TenantId: {TenantId}. {Errors}",
                    _tenantId, serviceResponse.Message);
                return serviceResponse;
            }

            tenant.NotificationSettings = settings;
            tenant.LastModifiedByUserId = _userId;
            tenant.LastModifiedOn = DateTimeOffset.UtcNow;

            _unitOfWork.TenantRepo.Update(tenant);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Update failed while saving notification settings for TenantId: {TenantId}", _tenantId);
                return serviceResponse;
            }

            serviceResponse.Data = BuildNotificationSettingsDto(_tenantId, settings);
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Notification settings updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while updating notification settings for TenantId: {TenantId}", _tenantId);
        }

        return serviceResponse;
    }

    /// <summary>
    /// Builds the strongly-typed response DTO from the tenant's notification settings,
    /// applying per-type defaults for any missing settings (FR-6).
    /// </summary>
    private static NotificationSettingsDto BuildNotificationSettingsDto(Guid tenantId, NotificationSettings? settings)
    {
        var effective = settings ?? new NotificationSettings();
        return new NotificationSettingsDto
        {
            TenantId = tenantId,
            LowCredits = effective.LowCredits,
            Subscription = effective.Subscription,
            PublishAgent = effective.PublishAgent,
            AgentRiskAssessmentApproval = effective.AgentRiskAssessmentApproval,
            SubscriptionRenewalReminderDays = effective.SubscriptionRenewalReminderDays,
            LowCreditThreshold = effective.LowCreditThreshold,
            DeliveryChannel = effective.DeliveryChannel
        };
    }

    /// <summary>
    /// Validates Azure Entra (Azure AD) credentials by attempting to acquire an access token.
    /// </summary>
    /// <returns>True if credentials are valid; false otherwise.</returns>
    public async Task<bool> ValidateAzureEntraCredentialsAsync()
    {
        try
        {
            // Extract Azure Entra configuration from environment
            var tenantId = _environmentConfig.AzureTenantId;
            var clientId = _environmentConfig.AzureEntraIdClientId;
            var clientSecret = _environmentConfig.AzureEntraIdClientSecret;

            _logger.LogInformation("Validating Azure Entra credentials for TenantId: {TenantId}", tenantId);

            // Prepare the token endpoint for the tenant
            var tokenEndpoint = $"https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token";

            using var httpClient = new HttpClient();

            // Prepare request content for client credentials flow
            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["scope"] = "https://graph.microsoft.com/.default",
                ["grant_type"] = "client_credentials"
            });

            // Send POST request to Azure AD token endpoint
            var response = await httpClient.PostAsync(tokenEndpoint, content);

            if (response.IsSuccessStatusCode)
            {
                return true;
            }
            else
            {
                // Log detailed failure for easier troubleshooting
                var responseBody = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("Azure Entra credential validation failed for TenantId: {TenantId}. Status: {StatusCode}, Response: {Response}", tenantId, response.StatusCode, responseBody);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while validating Azure Entra credentials for TenantId: {TenantId}", _environmentConfig.AzureTenantId);
            return false;
        }
    }

    // Searches account users whose first name, last name, or username matches the provided search term.
    public async Task<ServiceResponse<IEnumerable<AppUserBaseDto>>> SearchAccountUserAsync(string searchKey, bool includeCurrentUser)
    {
        // Initialize the response with a default failure message.
        var serviceResponse = new ServiceResponse<IEnumerable<AppUserBaseDto>>
        {
            Data = null,
            Message = "Unable to complete the user search. Please try again."
        };

        try
        {
            // Validate the search term before proceeding.
            if (string.IsNullOrWhiteSpace(searchKey))
            {
                _logger.LogWarning("Account user search failed because the search key was null or empty.");
                serviceResponse.Message = "Search key cannot be empty.";
                return serviceResponse;
            }

            // Retrieve users whose first name, last name, or username contains the search term.
            // When a specific space is selected (CurrentSpaceId != Guid.Empty), only users who
            // have access to that space (via the SpaceUser table) are returned, so that only
            // space-authorized users can be assigned in the share flow.
            var currentSpaceId = _currentTenantService.CurrentSpaceId;

            var accountUsers = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _tenantId &&
                    !w.IsDefault &&
                    (includeCurrentUser || w.Id != _userId) &&
                    (
                        w.FirstName.ToLower().Contains(searchKey.ToLower()) ||
                        w.LastName.ToLower().Contains(searchKey.ToLower()) ||
                        w.UserName.ToLower().Contains(searchKey.ToLower())
                    )
                )
                .ProjectToType<AppUserBaseDto>()
                .ToListAsync();

            // If a specific space is selected, keep only the users who have access to it.
            if (currentSpaceId != Guid.Empty)
            {
                var spaceUserIds = await _unitOfWork.SpaceUserRepo
                    .GetByConditionAsync(su =>
                        su.TenantId == _tenantId &&
                        su.SpaceId == currentSpaceId &&
                        su.IsActive)
                    .Select(su => su.UserId)
                    .Distinct()
                    .ToListAsync();

                accountUsers = accountUsers.Where(u => spaceUserIds.Contains(u.Id)).ToList();
            }

            // Populate the response with the search results.
            serviceResponse.Data = accountUsers;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"Search completed successfully. {accountUsers.Count} user(s) found.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while searching account users with key '{SearchKey}'", searchKey);
        }

        return serviceResponse;
    }
}
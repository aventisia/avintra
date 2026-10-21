namespace AccountsAPIs.Services;

public class TenantAccountService : ITenantAccountService
{
    private readonly ILogger<TenantAccountService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly Guid _userId;
    private readonly Guid _tenantId;
    private readonly string _userEmail;
    private readonly ILoginWithExternalAuthService _loginWithExternalAuthService;

    public TenantAccountService(
        ILogger<TenantAccountService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        EnvironmentConfig environmentConfig,
        ICurrentTenantService currentTenantService,
        ILoginWithExternalAuthService loginWithExternalAuthService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // Extract user ID from JWT token claims for audit purposes
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Extract tenant ID from JWT token claims
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
        _userEmail = httpContextAccessor.HttpContext?.User?.FindFirstValue("email") ?? string.Empty;
        _environmentConfig = environmentConfig;
        _currentTenantService = currentTenantService;
        _loginWithExternalAuthService = loginWithExternalAuthService;
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

            // Redact the stored single sign-on configuration; the client secret never leaves the server
            ApplyRedactedSsoConfig(tenantPreferencesDto, tenant.SSOConfigJson);

            // Keep the actionable warning visible while a previously connected tenant stays disabled with passwordless users
            var storedSsoConfig = SsoConfigHelpers.Parse(tenant.SSOConfigJson);
            if (!tenant.IsSSOEnabled && storedSsoConfig != null)
            {
                tenantPreferencesDto.SsoDisableWarning = await BuildSsoDisableWarningAsync();
            }

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
            var existingSsoConfig = SsoConfigHelpers.Parse(tenant.SSOConfigJson);
            var wasSsoEnabled = tenant.IsSSOEnabled;
            preferencesDto.Adapt(tenant);
            tenant.LastModifiedByUserId = _userId;
            var isDisablingSso = wasSsoEnabled && !tenant.IsSSOEnabled;

            if (tenant.IsSSOEnabled)
            {
                var enableValidation = await ValidateSsoEnablementAsync(tenant, existingSsoConfig);

                if (!enableValidation.IsValid)
                {
                    serviceResponse.StatusCode = enableValidation.StatusCode;
                    serviceResponse.Message = enableValidation.Message;
                    _logger.LogWarning("SSO enablement blocked for TenantId {TenantId}: {Reason}", _tenantId, enableValidation.Message);
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
            ApplyRedactedSsoConfig(updatedPreferencesDto, tenant.SSOConfigJson);

            if (isDisablingSso)
            {
                var disableWarning = await BuildSsoDisableWarningAsync();
                updatedPreferencesDto.SsoDisableWarning = disableWarning;

                if (disableWarning != null)
                {
                    await InsertSsoDisabledAuditLogAsync(disableWarning);

                    _logger.LogWarning(
                        "SSO disabled while passwordless users exist. TenantId={TenantId}, AffectedUserCount={AffectedUserCount}, AffectedAdmins={AffectedAdmins}",
                        _tenantId, disableWarning.AffectedUserCount, string.Join(",", disableWarning.AffectedAdmins));
                }
            }

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

    // Generates the administrator consent URL for connecting the tenant's identity provider.
    public async Task<ServiceResponse<string>> GetSsoAdminConsentUrlAsync()
    {
        var serviceResponse = new ServiceResponse<string>
        {
            Data = null,
            Message = "Failed to generate administrator consent URL. Please try again"
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
                return serviceResponse;
            }

            if (tenant.Type != TenantTypesEnum.Organization)
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = "Single sign-on is available for organization tenants only.";
                return serviceResponse;
            }

            var consentUrlResult = _loginWithExternalAuthService.GenerateAdminConsentUrlAsync(_userEmail, tenant.Id);

            if (string.IsNullOrWhiteSpace(consentUrlResult.Data))
            {
                serviceResponse.StatusCode = consentUrlResult.StatusCode;
                serviceResponse.Message = consentUrlResult.Message;
                return serviceResponse;
            }

            serviceResponse.Data = consentUrlResult.Data;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Administrator consent URL generated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while generating the administrator consent URL for TenantId: {TenantId}", _tenantId);
        }

        return serviceResponse;
    }

    // Binds the tenant granted by the identity provider to the tenant's single sign-on configuration.
    public async Task<ServiceResponse<TenantPreferenceDto>> CompleteSsoAdminConsentAsync(string grantedTenantId, string? state)
    {
        var serviceResponse = new ServiceResponse<TenantPreferenceDto>
        {
            Data = null,
            Message = "Failed to complete single sign-on consent. Please try again later."
        };

        try
        {
            var authState = _loginWithExternalAuthService.ConsumeAuthState(state);
            if (authState == null || authState.TenantId != _tenantId || !authState.AdminConsent)
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = "Invalid or expired SSO state.";
                _logger.LogWarning("Admin consent callback rejected for TenantId {TenantId}: invalid state.", _tenantId);
                return serviceResponse;
            }

            if (string.IsNullOrWhiteSpace(grantedTenantId))
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = "The granted tenant identifier is required.";
                return serviceResponse;
            }

            var tenant = await _unitOfWork.TenantRepo
                .GetByConditionAsync(t => t.Id == _tenantId)
                .FirstOrDefaultAsync();

            if (tenant == null)
            {
                serviceResponse.Message = "Tenant not found.";
                return serviceResponse;
            }

            if (tenant.Type != TenantTypesEnum.Organization)
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = "Single sign-on is available for organization tenants only.";
                return serviceResponse;
            }

            var config = SsoConfigHelpers.Parse(tenant.SSOConfigJson)
                ?? SsoConfigHelpers.CreateDefault(grantedTenantId, tenant.Domain);
            config.ExternalTenantId = grantedTenantId.Trim();
            config.EmailDomain = tenant.Domain.Trim().ToLowerInvariant();

            tenant.SSOConfigJson = SsoConfigHelpers.ToPersistedJson(config);
            tenant.LastModifiedByUserId = _userId;
            _unitOfWork.TenantRepo.Update(tenant);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to persist the single sign-on consent for TenantId: {TenantId}", _tenantId);
                return serviceResponse;
            }

            var preferencesDto = tenant.Adapt<TenantPreferenceDto>();
            ApplyRedactedSsoConfig(preferencesDto, tenant.SSOConfigJson);

            serviceResponse.Data = preferencesDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Single sign-on consent completed successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error occurred while completing single sign-on consent for TenantId: {TenantId}", _tenantId);
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
        return await ValidateEntraClientCredentialsAsync(
            _environmentConfig.AzureTenantId,
            _environmentConfig.AzureEntraIdClientId,
            _environmentConfig.AzureEntraIdClientSecret);
    }

    private void ApplyRedactedSsoConfig(TenantPreferenceDto dto, string? ssoConfigJson)
    {
        var ssoConfig = SsoConfigHelpers.Parse(ssoConfigJson);
        if (ssoConfig == null) return;

        dto.SSOConfigJson = SsoConfigHelpers.ToRedactedJson(ssoConfig);
    }

    private async Task<SsoDisableWarningDto?> BuildSsoDisableWarningAsync()
    {
        var taRoleId = await _unitOfWork.AccountRoleRepo
            .GetByConditionAsync(r => r.Name == CustomRolesEnum.TA.ToString())
            .Select(r => (Guid?)r.Id)
            .FirstOrDefaultAsync();

        var affectedAdmins = new List<string>();
        if (taRoleId.HasValue)
        {
            var passwordlessAdminNames = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(u =>
                    u.TenantId == _tenantId &&
                    !u.IsDisabled &&
                    u.PasswordHash == null &&
                    u.UserRoles.Any(ur => ur.RoleId == taRoleId.Value))
                .Select(u => u.UserName)
                .ToListAsync();

            affectedAdmins = passwordlessAdminNames
                .Where(n => !string.IsNullOrWhiteSpace(n))
                .Select(n => n!)
                .ToList();
        }

        var affectedUserCount = await _unitOfWork.AccountUserRepo
            .GetByConditionAsync(u => u.TenantId == _tenantId && !u.IsDisabled && u.PasswordHash == null)
            .CountAsync();

        if (affectedUserCount == 0) return null;

        return new SsoDisableWarningDto
        {
            WarnOnly = true,
            AffectedAdmins = affectedAdmins,
            AffectedUserCount = affectedUserCount,
            RecoveryHint = "Affected users can set a password from the login screen using Forgot password, then sign in with their email and password."
        };
    }

    private async Task InsertSsoDisabledAuditLogAsync(SsoDisableWarningDto warning)
    {
        var auditLog = new AuditLog
        {
            Id = Guid.NewGuid(),
            UserId = _userId,
            EntityName = nameof(Tenant),
            EntityId = _tenantId,
            Action = "SSO_DISABLED_WARN_ONLY",
            Changes = JsonSerializer.Serialize(new
            {
                affectedUserCount = warning.AffectedUserCount,
                affectedAdmins = warning.AffectedAdmins,
                actorUserId = _userId
            }),
            Timestamp = DateTime.UtcNow
        };

        await _unitOfWork.AuditLogRepo.InsertAsync(auditLog);

        if (!await _unitOfWork.SaveAsync())
        {
            _logger.LogWarning("Failed to persist the SSO disable audit entry for TenantId: {TenantId}", _tenantId);
        }
    }

    private (bool IsValid, int StatusCode, string Message, TenantSsoConfigDto? Config) BuildStoredSsoConfigAsync(
        Tenant tenant, TenantSsoConfigDto requestedConfig, TenantSsoConfigDto? existingConfig)
    {
        if (tenant.Type != TenantTypesEnum.Organization)
        {
            return (false, 400, "Single sign-on is available for organization tenants only.", null);
        }

        if (string.IsNullOrWhiteSpace(tenant.Domain))
        {
            return (false, 400, "Set the tenant's email domain before connecting single sign-on.", null);
        }

        var requestedDomain = string.IsNullOrWhiteSpace(requestedConfig.EmailDomain) ? tenant.Domain : requestedConfig.EmailDomain;

        if (!string.Equals(requestedDomain.Trim(), tenant.Domain.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            return (false, 400, "The single sign-on email domain must match the tenant's email domain.", null);
        }

        var config = SsoConfigHelpers.Clone(requestedConfig);
        config.V = SsoConfigHelpers.SchemaVersion;
        config.Provider = SsoConfigHelpers.MicrosoftEntraProvider;
        config.EmailDomain = tenant.Domain.Trim().ToLowerInvariant();
        config.ExternalTenantId = config.ExternalTenantId?.Trim() ?? string.Empty;

        return (true, 200, "Single sign-on configuration validated.", config);
    }

    private async Task<(bool IsValid, int StatusCode, string Message)> ValidateSsoEnablementAsync(
        Tenant tenant, TenantSsoConfigDto? storedConfig)
    {
        if (tenant.Type != TenantTypesEnum.Organization)
        {
            return (false, 400, "Single sign-on is available for organization tenants only.");
        }

        if (string.IsNullOrWhiteSpace(tenant.Domain))
        {
            return (false, 400, "Set the tenant's email domain before connecting single sign-on.");
        }

        if (storedConfig == null || string.IsNullOrWhiteSpace(storedConfig.ExternalTenantId))
        {
            return (false, 400, "Connect the identity provider before enabling single sign-on.");
        }

        if (!string.Equals(storedConfig.EmailDomain, tenant.Domain.Trim(), StringComparison.OrdinalIgnoreCase))
        {
            return (false, 400, "The single sign-on email domain must match the tenant's email domain.");
        }

        var isPlatformConfigured =
            _environmentConfig.AzureEntraIdEnabled &&
            !string.IsNullOrWhiteSpace(_environmentConfig.MicrosoftClientId) &&
            !string.IsNullOrWhiteSpace(_environmentConfig.AzureTenantId) &&
            !string.IsNullOrWhiteSpace(_environmentConfig.MicrosoftClientSecret);

        if (!isPlatformConfigured)
        {
            return (false, 400, "SSO credentials are not configured. Set the MICROSOFT_CLIENT_ID and MICROSOFT_CLIENT_SECRET environment variables.");
        }

        var areCredentialsValid = await ValidateEntraClientCredentialsAsync(
            _environmentConfig.AzureTenantId, _environmentConfig.MicrosoftClientId, _environmentConfig.MicrosoftClientSecret);

        if (!areCredentialsValid)
        {
            return (false, 400, "SSO credentials are invalid or expired.");
        }

        return (true, 200, "Single sign-on configuration validated.");
    }

    private async Task<bool> ValidateEntraClientCredentialsAsync(string tenantAuthority, string clientId, string clientSecret)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(tenantAuthority) || string.IsNullOrWhiteSpace(clientId) || string.IsNullOrWhiteSpace(clientSecret))
            {
                return false;
            }

            var tokenEndpoint = $"https://login.microsoftonline.com/{tenantAuthority}/oauth2/v2.0/token";

            using var httpClient = new HttpClient();

            var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["client_id"] = clientId,
                ["client_secret"] = clientSecret,
                ["scope"] = "https://graph.microsoft.com/.default",
                ["grant_type"] = "client_credentials"
            });

            var response = await httpClient.PostAsync(tokenEndpoint, content);

            if (response.IsSuccessStatusCode)
            {
                return true;
            }

            _logger.LogWarning("SSO credential validation failed. Status: {StatusCode}", response.StatusCode);
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Exception occurred while validating SSO credentials.");
            return false;
        }
    }
}
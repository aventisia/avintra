namespace WorkspaceAPIs.Services;

public class EmailTriggerService : IEmailTriggerService
{
    private readonly ILogger<EmailTriggerService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly IStringEncryptionService _stringEncryptionService;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IJobsExecutorService _jobsExecutorService;
    private readonly WorkspaceInternalDbContext _workspaceInternalDbContext;
    private readonly IResourceUserAccessService _resourceUserAccessService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private const int OUTLOOK_EXPIRY_MINUTES = 10080;

    public IResourceUserAccessService ResourceUserAccessService => _resourceUserAccessService;

    public EmailTriggerService(
        ILogger<EmailTriggerService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IStringEncryptionService stringEncryptionService,
        EnvironmentConfig environmentConfig,
        IJobsExecutorService jobsExecutorService,
        WorkspaceInternalDbContext workspaceInternalDbContext,
        IResourceUserAccessService resourceUserAccessService,
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // Extract user ID from JWT claim or set to Guid.Empty if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _stringEncryptionService = stringEncryptionService;
        _environmentConfig = environmentConfig;
        _jobsExecutorService = jobsExecutorService;
        _workspaceInternalDbContext = workspaceInternalDbContext;
        _resourceUserAccessService = resourceUserAccessService;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
    }

    // Retrieves all email triggers.
    public async Task<ServiceResponse<IEnumerable<EmailTriggerDto>>> GetEmailTriggerListAsync(bool isPersonal)
    {
        // Initialize response with failure defaults
        var serviceResponse = new ServiceResponse<IEnumerable<EmailTriggerDto>>
        {
            Data = null,
            Message = "Failed to retrieve email triggers. Please try again."
        };

        try
        {
            // Retrieve email triggers based on ownership / shared access
            List<Trigger> emailTriggers = new();
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccess = new();

            // Personal mode → only current user's triggers
            if (isPersonal)
            {
                emailTriggers = await _unitOfWork.TriggerRepo
                    .GetByConditionAsync(w =>
                        w.TriggerType == TriggerTypesEnum.Email &&
                        w.CreatedByUserId == _userId &&
                        w.EnvType == _currentTenantService.CurrentEnvType)
                    .OrderByDescending(o => o.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .Include(i => i.TriggerFlowVersions)
                        .ThenInclude(i2 => i2.FlowVersion)
                            .ThenInclude(i3 => i3.Flow)
                    .AsNoTracking()
                    .ToListAsync();
            }
            else
            {
                // Retrieve accessible trigger IDs with permissions
                resourceAccess = await _resourceUserAccessService.GetAccessibleResourcesWithAccessAsync(
                    _userId,
                    ResourceTypeEnum.Trigger,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    }
                );

                // Retrieve tenant-wide or explicitly shared email triggers
                emailTriggers = await _unitOfWork.TriggerRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId != _userId &&
                        w.EnvType == _currentTenantService.CurrentEnvType &&
                        (
                            w.IsTenantWideAccess ||
                            resourceAccess.Keys.Contains(w.Id)
                        )
                    )
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .Include(i => i.TriggerFlowVersions)
                        .ThenInclude(i2 => i2.FlowVersion)
                            .ThenInclude(i3 => i3.Flow)
                    .OrderByDescending(o => o.CreatedOn)
                    .AsNoTracking()
                    .ToListAsync();
            }

            // Map to DTOs
            var emailTriggerDtoList = emailTriggers.Adapt<List<EmailTriggerDto>>();

            // Assign access levels:
            // - Personal triggers are always owned by the current user.
            // - Shared/tenant-wide triggers use granted permissions, defaulting to View.
            emailTriggerDtoList.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);
            });

            serviceResponse.Data = emailTriggerDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Email triggers retrieved successfully";
        }
        catch (Exception ex)
        {
            // Log unexpected errors during retrieval
            _logger.LogError(ex, "An error occurred while retrieving email triggers from the database.");
        }

        return serviceResponse;
    }

    // Retrieves a single email trigger by ID.
    public async Task<ServiceResponse<EmailTriggerDto>> GetEmailTriggerAsync(Guid emailTriggerId)
    {
        // Initialize default response
        var serviceResponse = new ServiceResponse<EmailTriggerDto>
        {
            Data = null,
            Message = "Failed to retrieve email trigger. Please try again."
        };

        try
        {
            // Fetch email trigger from the repository
            var emailTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == emailTriggerId && w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Check if the email trigger exists
            if (emailTrigger == null)
            {
                serviceResponse.Message = "Email trigger does not exist";
                return serviceResponse; // Return early if not found
            }

            // Verify current user has permission to view this trigger
            var (canView, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                emailTrigger.Id,
                ResourceTypeEnum.Trigger,
                emailTrigger.CreatedByUserId,
                emailTrigger.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                _logger.LogInformation("User {UserId} attempted unauthorized access to email trigger {TriggerId}.", _userId, emailTriggerId);
                serviceResponse.Message = "You do not have access to view this email trigger.";
                return serviceResponse;
            }

            // Map entity to DTO
            serviceResponse.Data = emailTrigger.Adapt<EmailTriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Email trigger retrieved successfully";
        }
        catch (Exception ex)
        {
            // Log error if retrieval fails
            _logger.LogError(ex, "An error occurred while retrieving email trigger with ID {EmailTriggerId}", emailTriggerId);
        }

        return serviceResponse;
    }

    // Creates a new email trigger.
    public async Task<ServiceResponse<EmailTriggerDto>> CreateEmailTriggerAsync(EmailTriggerDto emailTriggerDto)
    {
        // Initialize default response with failure state
        var serviceResponse = new ServiceResponse<EmailTriggerDto>
        {
            Data = null,
            Message = "Failed to create email trigger. Please try again."
        };

        try
        {
            // Block creating new email triggers while in the PROD environment.
            var prodBlock = CreateResourceGuard.Validate<EmailTriggerDto>(
                _currentTenantService.CurrentEnvType,
                "email trigger");
            if (prodBlock != null)
            {
                return prodBlock;
            }

            // Validate duplicate trigger by name (case-insensitive)
            var existingTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == emailTriggerDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreAutoIncludes()
                .FirstOrDefaultAsync();

            if (existingTrigger != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Email trigger with the same name already exists.";
                return serviceResponse; // Return early if duplicate found
            }

            if (DateTimeOffset.UtcNow.AddMinutes(OUTLOOK_EXPIRY_MINUTES) < emailTriggerDto.ExpiryDateTime)
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = $"Expiry date cannot exceed {OUTLOOK_EXPIRY_MINUTES} minutes from now.";
                return serviceResponse;
            }

            // Trim all string properties on the DTO
            emailTriggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(emailTriggerDto);

            // Resolve the credential name to its ID (entity keeps the ID per name-based Agent Builder).
            emailTriggerDto.CredentialId = await ResolveCredentialIdAsync(emailTriggerDto.CredentialName, emailTriggerDto.CredentialId);

            // Convert DTO to Trigger entity
            var newEmailTrigger = emailTriggerDto.Adapt<Trigger>();
            newEmailTrigger.Id = Guid.NewGuid();

            // Serialize EmailTriggerModel properties into Metadata JSON
            var model = (EmailTriggerModel)emailTriggerDto;

            // Generate a random clientState token used to verify Graph webhook notifications
            model.ClientState = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

            // Create or update the email subscription and update the DTO with the subscription ID
            var subscription = await ManageEmailTriggerSubscriptionAsync(model, "create", newEmailTrigger.Id);
            if (subscription.StatusCode != 200)
            {
                serviceResponse.Message = subscription.Message;
                return serviceResponse;
            }

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };

            // Ensure enums serialize as strings
            jsonOptions.Converters.Add(new JsonStringEnumConverter());

            newEmailTrigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(subscription.Data, jsonOptions));

            // Set the TriggerType explicitly
            newEmailTrigger.TriggerType = TriggerTypesEnum.Email;
            newEmailTrigger.EnvType = _currentTenantService.CurrentEnvType;

            // Set audit fields: created and last modified by current user
            newEmailTrigger.CreatedByUserId = _userId;
            newEmailTrigger.LastModifiedByUserId = _userId;

            // Insert entity into repository
            await _unitOfWork.TriggerRepo.InsertAsync(newEmailTrigger);

            // Save changes to database and validate success
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while creating email trigger with name {EmailTriggerName}.", emailTriggerDto.Name);
                return serviceResponse;
            }

            // Assign ownership of the newly created trigger to current user
            if (!await _resourceUserAccessService.AssignOwnerAsync(_userId, newEmailTrigger.Id, ResourceTypeEnum.Trigger))
            {
                _logger.LogError("Failed assigning owner permissions for email trigger {TriggerId}.", newEmailTrigger.Id);
                serviceResponse.Message = "Failed assigning ownership.";
                return serviceResponse;
            }

            // Retrieve all agents from the database that are linked to the provided email trigger DTO.
            // Only include agents whose IDs are in emailTriggerDto.Agents and are marked as published.
            var agentIds = emailTriggerDto.Agents?
                .Select(a => a.Id)
                .ToList();

            var agents = agentIds != null && agentIds.Any()
                ? await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => agentIds.Contains(w.Id) && w.IsPublished)
                    .ToListAsync()
                : new List<FlowVersion>();

            // Proceed only if matching agents are found.
            if (agents.Count > 0)
            {
                // Create a list of TriggerFlowVersion entities linking the new email trigger to each agent.
                var triggerFlowVersions = agents.Select(agent => new TriggerFlowVersion
                {
                    TriggerId = newEmailTrigger.Id,
                    FlowVersionId = agent.Id,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                }).ToList();

                // Insert the new TriggerFlowVersion entries into the repository.
                await _unitOfWork.TriggerFlowVersionRepo.InsertAsync(triggerFlowVersions);

                // Save changes to the database and check if the operation succeeded.
                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }
            }

            newEmailTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == newEmailTrigger.Id)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Map back to DTO for response
            serviceResponse.Data = newEmailTrigger.Adapt<EmailTriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Email trigger created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating email trigger with name {EmailTriggerName}.", emailTriggerDto.Name);
        }

        return serviceResponse;
    }

    // Updates an existing email trigger.
    public async Task<ServiceResponse<EmailTriggerDto>> UpdateEmailTriggerAsync(EmailTriggerDto emailTriggerDto)
    {
        // Initialize default response with failure
        var serviceResponse = new ServiceResponse<EmailTriggerDto>
        {
            Data = null,
            Message = "Failed to update email trigger. Please try again."
        };

        try
        {
            // Retrieve existing email trigger
            var emailTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == emailTriggerDto.Id && w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.TriggerFlowVersions)
                .SingleOrDefaultAsync();

            // Validate existence
            if (emailTrigger == null)
            {
                serviceResponse.Message = "Email trigger does not exist";
                return serviceResponse; // Early return
            }

            // Require OM for PROD edits based on the persisted trigger environment.
            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<EmailTriggerDto>(
                emailTrigger.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "email trigger");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            // Validate current user has permission to update this trigger
            var (canEdit, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                emailTrigger.Id,
                ResourceTypeEnum.Trigger,
                emailTrigger.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                _logger.LogInformation("User {UserId} attempted unauthorized update of email trigger {TriggerId}.", _userId, emailTrigger.Id);
                serviceResponse.Message = "You do not have access to update this email trigger.";
                return serviceResponse;
            }

            // Check for duplicate name among other triggers
            var duplicateTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == emailTriggerDto.Name.ToLower() &&
                    w.Id != emailTriggerDto.Id &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .FirstOrDefaultAsync();

            if (duplicateTrigger != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Email trigger with the same name already exists.";
                return serviceResponse;
            }

            // Normalize input (trim all string properties)
            emailTriggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(emailTriggerDto);

            // Resolve the credential name to its ID (entity keeps the ID per name-based Agent Builder).
            if (!string.IsNullOrWhiteSpace(emailTriggerDto.CredentialName))
            {
                emailTriggerDto.CredentialId = await ResolveCredentialIdAsync(emailTriggerDto.CredentialName, emailTriggerDto.CredentialId);
            }

            // Validate ExpiryDateTime cannot be reduced
            if (emailTrigger.Metadata.RootElement.TryGetProperty("expiryDateTime", out var existingExpiryElement))
            {
                var existingExpiry = existingExpiryElement.GetDateTime();

                if (emailTriggerDto.ExpiryDateTime < existingExpiry)
                {
                    serviceResponse.StatusCode = 400;
                    serviceResponse.Message = "Expiry date cannot be earlier than the existing expiry date.";
                    return serviceResponse;
                }
            }

            if (DateTimeOffset.UtcNow.AddMinutes(OUTLOOK_EXPIRY_MINUTES) < emailTriggerDto.ExpiryDateTime)
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = $"Expiry date cannot exceed {OUTLOOK_EXPIRY_MINUTES} minutes from now.";
                return serviceResponse;
            }

            // Update basic fields
            emailTrigger.Timezone = emailTriggerDto.Timezone;

            // JSON serializer configuration
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };

            // Deserialize existing metadata into model
            var model = System.Text.Json.JsonSerializer.Deserialize<EmailTriggerModel>(
                emailTrigger.Metadata.RootElement.GetRawText(),
                jsonOptions);

            // Preserve existing subscriptionId and update related fields
            if (emailTrigger.Metadata.RootElement.TryGetProperty("subscriptionId", out var subId))
            {
                model.SubscriptionId = subId.GetString();
                model.ResubscribeEnabled = emailTriggerDto.ResubscribeEnabled;
                model.ExpiryDateTime = emailTriggerDto.ExpiryDateTime;
                model.ResubscribeFrequency = emailTriggerDto.ResubscribeFrequency;
            }

            // Call external/internal service to manage subscription update
            var subscription = await ManageEmailTriggerSubscriptionAsync(model, "update", emailTriggerDto.Id);

            // Handle subscription failure
            if (subscription.StatusCode != 200)
            {
                serviceResponse.Message = subscription.Message;
                return serviceResponse;
            }

            // Ensure enums are serialized as strings
            jsonOptions.Converters.Add(new JsonStringEnumConverter());

            // Update metadata with latest subscription data
            emailTrigger.Metadata = JsonDocument.Parse(
                System.Text.Json.JsonSerializer.Serialize(subscription.Data, jsonOptions)
            );

            // Set audit fields to track who last modified the trigger
            emailTrigger.LastModifiedByUserId = _userId;

            // Persist changes to repository
            _unitOfWork.TriggerRepo.Update(emailTrigger);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while updating email trigger with ID {EmailTriggerId}.", emailTriggerDto.Id);
                return serviceResponse;
            }

            // TODO: ENABLE TRIGGER FLOW VERSION SYNC IF AGENT MAPPING IS USED
            // // =========================
            // // SYNC TRIGGER FLOW VERSIONS (WITH CHANGE DETECTION)
            // // =========================

            // // Track whether any changes were made
            // var hasChanges = false;

            // // Extract agent IDs from request
            // var requestedAgentIds = emailTriggerDto.Agents?
            //     .Select(a => a.Id)
            //     .ToHashSet() ?? new HashSet<Guid>();

            // // Existing mappings from DB
            // var existingMappings = emailTrigger.TriggerFlowVersions ?? new List<TriggerFlowVersion>();

            // var existingAgentIds = existingMappings
            //     .Select(tfv => tfv.FlowVersionId)
            //     .ToHashSet();


            // // ----------- ADD NEW MAPPINGS -----------
            // // Agents present in request but not in DB
            // var agentIdsToAdd = requestedAgentIds.Except(existingAgentIds).ToList();

            // if (agentIdsToAdd.Any())
            // {
            //     var agentsToAdd = await _unitOfWork.FlowVersionRepo
            //         .GetByConditionAsync(w => agentIdsToAdd.Contains(w.Id) && w.IsPublished)
            //         .ToListAsync();

            //     if (agentsToAdd.Any())
            //     {
            //         var newMappings = agentsToAdd.Select(agent => new TriggerFlowVersion
            //         {
            //             TriggerId = emailTrigger.Id,
            //             FlowVersionId = agent.Id,
            //             CreatedByUserId = _userId,
            //             LastModifiedByUserId = _userId
            //         }).ToList();

            //         await _unitOfWork.TriggerFlowVersionRepo.InsertAsync(newMappings);
            //         hasChanges = true;
            //     }
            // }


            // // ----------- REMOVE OLD MAPPINGS -----------
            // // Agents present in DB but not in request
            // var agentIdsToDelete = existingAgentIds.Except(requestedAgentIds).ToList();

            // if (agentIdsToDelete.Any())
            // {
            //     var mappingsToDelete = existingMappings
            //         .Where(w => agentIdsToDelete.Contains(w.FlowVersionId))
            //         .ToList();

            //     if (mappingsToDelete.Any())
            //     {
            //         _unitOfWork.TriggerFlowVersionRepo.Delete(mappingsToDelete);
            //         hasChanges = true;
            //     }
            // }


            // // ----------- SAVE ONLY IF CHANGED -----------
            // if (hasChanges)
            // {
            //     if (!await _unitOfWork.SaveAsync())
            //     {
            //         _logger.LogError("Failed to sync TriggerFlowVersions for email trigger ID {emailTriggerId}.", emailTrigger.Id);
            //         return serviceResponse;
            //     }
            // }

            emailTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == emailTrigger.Id)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Map back to DTO for response
            serviceResponse.Data = emailTrigger.Adapt<EmailTriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Email trigger updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while updating email trigger with ID {EmailTriggerId}.", emailTriggerDto.Id);
        }

        return serviceResponse;
    }

    // Deletes a single email trigger.
    public async Task<ServiceResponse<bool>> DeleteEmailTriggerAsync(Guid emailTriggerId)
    {
        // Initialize response with failure defaults
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete email trigger. Please try again."
        };

        try
        {
            // Retrieve the email trigger
            var emailTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == emailTriggerId && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            // Check existence
            if (emailTrigger == null)
            {
                serviceResponse.Message = "Email trigger does not exist";
                return serviceResponse;
            }

            // PROD-guard: block deletion of PROD triggers or triggers with a same-name PROD twin.
            // Checked before the provider unsubscribe so a blocked deletion has no side effects.
            var guardBlock = await DeleteResourceGuard.ValidateAsync(
                _unitOfWork.TriggerRepo,
                emailTrigger.EnvType,
                emailTrigger.Name,
                w => w.Name.ToLower() == emailTrigger.Name.ToLower() &&
                     w.EnvType == ConfigureEnvironmentType.Prod &&
                     w.TenantId == emailTrigger.TenantId &&
                     w.SpaceId == emailTrigger.SpaceId,
                "email trigger");
            if (guardBlock != null)
            {
                return guardBlock;
            }

            // Configure JSON options first
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };

            // Add the enum converter
            jsonOptions.Converters.Add(new JsonStringEnumConverter());

            // Deserialize the Metadata JSON into EmailTriggerModel
            var model = System.Text.Json.JsonSerializer.Deserialize<EmailTriggerModel>(
                emailTrigger.Metadata.RootElement.GetRawText(),
                jsonOptions
            );

            // Subscribe email trigger before deleting
            var subscription = await ManageEmailTriggerSubscriptionAsync(model!, "delete", emailTriggerId);

            // deletion failed at provider level
            if (subscription.StatusCode != 200)
            {
                serviceResponse.Message = subscription.Message;
                return serviceResponse;
            }

            // Validate current user has permission to delete this trigger
            var (canDelete, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                emailTrigger.Id,
                ResourceTypeEnum.Trigger,
                emailTrigger.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                }
            );

            if (!canDelete)
            {
                _logger.LogInformation("User {UserId} attempted unauthorized deletion of email trigger {TriggerId}.", _userId, emailTriggerId);
                serviceResponse.Message = "You do not have access to delete this email trigger.";
                return serviceResponse;
            }

            // Remove resource share mappings before deleting trigger
            await _resourceUserAccessService.DeleteResourceUserAccessesAsync(emailTrigger.Id, ResourceTypeEnum.Trigger);

            // Delete entity
            _unitOfWork.TriggerRepo.Delete(emailTrigger);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while deleting email trigger with ID {EmailTriggerId}.", emailTriggerId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Email trigger deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while deleting email trigger with ID {EmailTriggerId}.", emailTriggerId);
        }

        return serviceResponse;
    }

    // Deletes multiple email triggers.
    public async Task<ServiceResponse<bool>> DeleteEmailTriggersAsync(IEnumerable<Guid> emailTriggerIds)
    {
        // Initialize response with default failure
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete email triggers. Please try again."
        };

        try
        {
            // Retrieve triggers that match provided IDs
            var emailTriggers = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(t => emailTriggerIds.Contains(t.Id) && t.EnvType == _currentTenantService.CurrentEnvType)
                .ToListAsync();

            // Check if any triggers were found
            if (emailTriggers == null || emailTriggers.Count == 0)
            {
                serviceResponse.Message = "Email triggers not found";
                return serviceResponse;
            }

            // PROD-guard: block the whole batch if any trigger is PROD or has a same-name PROD twin.
            // Checked before the provider unsubscribe so a blocked deletion has no side effects.
            var blockedNames = new List<string>();
            foreach (var emailTrigger in emailTriggers)
            {
                var guardBlock = await DeleteResourceGuard.ValidateAsync(
                    _unitOfWork.TriggerRepo,
                    emailTrigger.EnvType,
                    emailTrigger.Name,
                    w => w.Name.ToLower() == emailTrigger.Name.ToLower() &&
                         w.EnvType == ConfigureEnvironmentType.Prod &&
                         w.TenantId == emailTrigger.TenantId &&
                         w.SpaceId == emailTrigger.SpaceId,
                    "email trigger");
                if (guardBlock != null)
                {
                    blockedNames.Add(emailTrigger.Name);
                }
            }

            if (blockedNames.Count > 0)
            {
                serviceResponse.Message =
                    $"Cannot delete the following email trigger(s) because they are published (PROD) or have a same-name PROD version: {string.Join(", ", blockedNames)}";
                return serviceResponse;
            }

            // JSON options
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };

            jsonOptions.Converters.Add(new JsonStringEnumConverter());

            // Unsubscribe each trigger before deleting
            foreach (var emailTrigger in emailTriggers)
            {
                var model = System.Text.Json.JsonSerializer.Deserialize<EmailTriggerModel>(
                    emailTrigger.Metadata.RootElement.GetRawText(),
                    jsonOptions
                );

                if (model != null)
                {
                    // Subscribe email trigger before deleting
                    var subscription = await ManageEmailTriggerSubscriptionAsync(model!, "delete", emailTrigger.Id);

                    // deletion failed at provider level
                    if (subscription.StatusCode != 200)
                    {
                        serviceResponse.Message = subscription.Message;
                        return serviceResponse;
                    }
                }
            }

            // Validate delete access for all triggers
            foreach (var trigger in emailTriggers)
            {
                var (canDelete, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                    _userId,
                    trigger.Id,
                    ResourceTypeEnum.Trigger,
                    trigger.CreatedByUserId,
                    false,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                    }
                );

                if (!canDelete)
                {
                    _logger.LogInformation("User {UserId} attempted unauthorized bulk deletion.", _userId);
                    serviceResponse.Message = "You do not have access to delete one or more email triggers.";
                    return serviceResponse;
                }
            }

            // Remove all resource share mappings before deleting triggers
            await _resourceUserAccessService.DeleteResourceUserAccessesAsync(emailTriggerIds, ResourceTypeEnum.Trigger);

            // Delete triggers
            _unitOfWork.TriggerRepo.Delete(emailTriggers);

            // Persist deletion
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while deleting multiple email triggers.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{emailTriggers.Count} email triggers deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while deleting multiple email triggers.");
        }

        return serviceResponse;
    }

    // Checks if an email trigger name is available.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsEmailTriggerNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize response with default failure
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check email trigger name availability. Please try again."
        };

        try
        {
            // Check repository for existing trigger with the same name
            var triggerExists = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => 
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (triggerExists != null)
            {
                // Duplicate exists
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Email trigger name already exists";
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                return serviceResponse;
            }

            // Name is available
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.Message = "Email trigger name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while checking email trigger name availability for '{EmailTriggerName}'.", checkAvailabilityDto.UserInput);
        }

        return serviceResponse;
    }

    // Retrieves agents assigned to an email trigger.
    public async Task<ServiceResponse<IEnumerable<AssignAgentTriggerDto>>> GetAgentsByEmailTriggerAsync(Guid emailTriggerId)
    {
        // Initialize response with default failure
        var serviceResponse = new ServiceResponse<IEnumerable<AssignAgentTriggerDto>>
        {
            Data = null,
            Message = "Failed to retrieve agents. Please try again."
        };

        try
        {
            // Retrieve all flows associated with this email trigger
            var triggerFlows = await _unitOfWork.TriggerFlowVersionRepo
                .GetByConditionAsync(w => w.TriggerId == emailTriggerId)
                                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .ToListAsync();


            serviceResponse.Data = triggerFlows.Adapt<List<AssignAgentTriggerDto>>(); ;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Agents retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving agents for email trigger ID {EmailTriggerId}.", emailTriggerId);
        }

        return serviceResponse;
    }

    // Creates jobs for all flow versions associated with the given trigger ID.
    public async Task<ServiceResponse<bool>> CreateJobByEmailTriggerIdAsync(string triggerId, JsonElement payload)
    {
        // Default failure response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 200,
            Message = "Failed to create job(s) from trigger. Please try again."
        };

        try
        {
            // Validate triggerId as GUID
            if (!Guid.TryParse(triggerId, out var triggerGuid) || triggerGuid == Guid.Empty)
            {
                _logger.LogWarning("Invalid triggerId received: {TriggerId}", triggerId);
                serviceResponse.Message = "Invalid triggerId provided.";
                return serviceResponse;
            }

            // IMPORTANT: Using WorkspaceInternalDbContext to retrieve trigger along with its flow versions.
            // Any changes to this query (Includes / filtering) may affect downstream logic.
            // Modify with caution.
            // Retrieve trigger along with its flow versions
            var trigger = await _workspaceInternalDbContext.Triggers
                .Where(x => x.Id == triggerGuid)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.FlowVersionHistories)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            // Trigger not found
            if (trigger == null)
            {
                _logger.LogWarning("Trigger not found for id: {TriggerId}", triggerId);
                serviceResponse.Message = $"No trigger found for id: {triggerId}";
                return serviceResponse;
            }

            var triggerFlowVersions = trigger.TriggerFlowVersions?.ToList();

            // No flow versions mapped to trigger
            if (triggerFlowVersions == null || !triggerFlowVersions.Any())
            {
                _logger.LogWarning("No flow versions found for triggerId: {TriggerId}", triggerId);
                serviceResponse.Message = "No flow versions configured for this trigger.";
                return serviceResponse;
            }

            // Create jobs for each associated flow version
            foreach (var triggerFlowVersion in triggerFlowVersions)
            {
                // Skip invalid entries
                if (triggerFlowVersion.FlowVersion == null)
                {
                    _logger.LogWarning("Skipping invalid FlowVersionId for triggerId: {TriggerId}", triggerId);
                    continue;
                }

                // Convert the incoming request into a new Job entity
                var newJob = new Job()
                {
                    TenantId = triggerFlowVersion.TenantId,
                    FlowVersionId = triggerFlowVersion.FlowVersionId,
                    TriggerType = trigger.TriggerType,
                    InputArgumentsJson = ExtractAndBuildInputJson(payload),
                    MachineId = null,
                    Priority = JobPriorityEnum.Normal,
                    Status = JobStatusEnum.Created,
                    CreatedOn = DateTimeOffset.UtcNow,
                    IsPublished = triggerFlowVersion.FlowVersion.IsPublished,
                    FlowVersionHistoryId = triggerFlowVersion.FlowVersion.FlowVersionHistories
                        .OrderByDescending(o => o.CreatedOn)
                        .Select(s => (Guid?)s.Id)
                        .FirstOrDefault()
                };

                // Insert the new job into the repository
                await _unitOfWork.JobRepo.InsertAsync(newJob);

                // Check if changes were successfully saved
                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }

                // If the flow version is published, trigger the job execution.
                if (newJob.IsPublished)
                {
                    // Execute the job asynchronously.
                    await _jobsExecutorService.ExecuteJobCommandAsync(newJob);
                }
            }

            // Success (even if partial)
            serviceResponse.Data = true;
            serviceResponse.Message = "Job(s) created successfully from trigger.";
        }
        catch (Exception ex)
        {
            // ❌ Unexpected error
            _logger.LogError(ex, "Error creating job(s) from triggerId: {TriggerId}", triggerId);
        }

        return serviceResponse;
    }

    private async Task<ServiceResponse<EmailTriggerModel>> ManageEmailTriggerSubscriptionAsync(EmailTriggerModel? emailTriggerModel, string action, Guid triggerId)
    {
        // initialize response with action-based failure message
        var serviceResponse = new ServiceResponse<EmailTriggerModel>
        {
            Data = emailTriggerModel,
            Message = $"Failed to {action} subscription. Please try again."
        };

        // Initialize HttpClient for API requests
        using var httpClient = new HttpClient();

        // Check if mailbox is provided
        if (string.IsNullOrEmpty(emailTriggerModel.Mailbox))
        {
            _logger.LogWarning("Invalid mailbox value.");

            serviceResponse.Message = "Mailbox cannot be empty.";
            return serviceResponse;
        }

        // Determine provider (Outlook / Gmail)
        switch (emailTriggerModel.Provider)
        {
            // Handle Microsoft 365 (Outlook) subscription lifecycle via Microsoft Graph
            case TriggerProviderTypesEnum.M365:
                {
                    // Acquire access token for Microsoft Graph API
                    var accessToken = await GetM365AccessTokenAsync(emailTriggerModel.CredentialName ?? string.Empty);

                    // Attach authorization header for all outgoing requests
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                    httpClient.BaseAddress = new Uri("https://graph.microsoft.com/v1.0/");

                    // Normalize application base URL (ensure HTTPS and no trailing slash)
                    var baseUrl = _environmentConfig.AppBaseUrl?.Trim().TrimEnd('/');
                    if (!baseUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                        baseUrl = "https://" + baseUrl;

                    // Endpoint that will receive Graph change notifications
                    var notificationUrl = $"{baseUrl}/workspace/api/email-trigger/notify/{triggerId}";

                    // Build resource path targeting mailbox or specific folder
                    var resourcePath = !string.IsNullOrEmpty(emailTriggerModel.Folder)
                        ? $"/users/{emailTriggerModel.Mailbox}/mailFolders/{emailTriggerModel.Folder}/messages"
                        : $"/users/{emailTriggerModel.Mailbox}/messages";

                    // Check if subscription has expired and adjust actions accordingly
                    if (emailTriggerModel.ExpiryDateTime <= DateTimeOffset.UtcNow)
                    {
                        if (action.Equals("update", StringComparison.OrdinalIgnoreCase))
                        {
                            action = "created"; // Expired, create a new subscription instead of updating
                        }
                        else if (action.Equals("delete", StringComparison.OrdinalIgnoreCase))
                        {
                            // Do not delete if expired, return success response with 200 status code
                            serviceResponse.StatusCode = 200;
                            return serviceResponse;
                        }
                    }

                    HttpResponseMessage response;

                    // Execute action-specific API call (create, renew/update, delete)
                    switch (action.ToLower())
                    {
                        case "create":
                            // Create a new subscription for message notifications
                            var subscriptionRequest = new
                            {
                                changeType = "created",
                                notificationUrl = notificationUrl,
                                resource = resourcePath,
                                expirationDateTime = emailTriggerModel.ExpiryDateTime.UtcDateTime.ToString("o"),
                                clientState = emailTriggerModel.ClientState
                            };

                            var postRequest = new HttpRequestMessage(HttpMethod.Post, "subscriptions")
                            {
                                Content = CreateJsonContent(subscriptionRequest)
                            };

                            response = await httpClient.SendAsync(postRequest);

                            // Extract and persist subscription ID for future operations
                            if (response.IsSuccessStatusCode)
                            {
                                var responseContent = await response.Content.ReadAsStringAsync();
                                using var doc = JsonDocument.Parse(responseContent);

                                if (doc.RootElement.TryGetProperty("id", out var subscriptionIdProperty))
                                {
                                    emailTriggerModel.SubscriptionId = subscriptionIdProperty.GetString();
                                }
                            }
                            break;

                        case "update":
                            // Renew subscription by extending expiration and/or updating callback URL
                            var updateRequest = new
                            {
                                expirationDateTime = emailTriggerModel.ExpiryDateTime.UtcDateTime.ToString("o"),
                                notificationUrl = notificationUrl
                            };

                            var patchRequest = new HttpRequestMessage(HttpMethod.Patch, $"subscriptions/{emailTriggerModel.SubscriptionId}")
                            {
                                Content = CreateJsonContent(updateRequest)
                            };

                            response = await httpClient.SendAsync(patchRequest);
                            break;

                        case "delete":
                            // Remove existing subscription from Microsoft Graph
                            response = await httpClient.DeleteAsync(
                                $"subscriptions/{emailTriggerModel.SubscriptionId}");
                            break;

                        default:
                            // Guard against unsupported actions
                            _logger.LogWarning("Unknown action for M365 subscription: {Action}", action);
                            return serviceResponse;
                    }

                    // Handle unsuccessful responses and extract Graph error message if available
                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogError("M365 subscription {Action} failed. StatusCode: {StatusCode}", action, response.StatusCode);

                        var responseContent = await response.Content.ReadAsStringAsync();
                        try
                        {
                            using var doc = JsonDocument.Parse(responseContent);
                            var message = doc.RootElement
                                             .GetProperty("error")
                                             .GetProperty("message")
                                             .GetString();

                            serviceResponse.Message = message;
                        }
                        catch
                        {
                            // Fallback to raw response if structured error parsing fails
                            serviceResponse.Message = responseContent;
                        }

                        return serviceResponse;
                    }

                    // Return success response with updated model
                    serviceResponse.StatusCode = 200;
                    serviceResponse.Message = $"M365 subscription {action} successful.";
                    serviceResponse.Data = emailTriggerModel;

                    return serviceResponse;
                }

            case TriggerProviderTypesEnum.Google:
                // -------------------------------
                // Gmail subscription using Gmail Push API
                // -------------------------------
                {
                    // Determine folder/label (Gmail uses labelIds)
                    var labelIds = !string.IsNullOrEmpty(emailTriggerModel.Folder)
                        ? new string[] { emailTriggerModel.Folder }
                        : new string[] { "INBOX" };

                    // Build request body
                    var gmailRequest = new
                    {
                        labelIds = labelIds,
                        topicName = "projects/your-project/topics/email-trigger-topic"
                    };

                    var content = new StringContent(
                        System.Text.Json.JsonSerializer.Serialize(gmailRequest),
                        Encoding.UTF8,
                        "application/json"
                    );

                    HttpResponseMessage response;

                    // Determine action: create / update / delete
                    switch (action.ToLower())
                    {
                        case "create":
                        case "update": // Gmail watch API does not support update; recreate subscription
                            response = await httpClient.PostAsync(
                                $"https://gmail.googleapis.com/gmail/v1/users/{emailTriggerModel.Mailbox}/watch",
                                content
                            );
                            break;

                        case "delete":
                            response = await httpClient.PostAsync(
                                $"https://gmail.googleapis.com/gmail/v1/users/{emailTriggerModel.Mailbox}/stop",
                                null
                            );
                            break;

                        default:
                            _logger.LogWarning("Unknown action for Gmail subscription: {Action}", action);
                            return serviceResponse;
                    }

                    // Check API response
                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogError("Gmail subscription {Action} failed. StatusCode: {StatusCode}", action, response.StatusCode);
                        return serviceResponse;
                    }

                    return serviceResponse;
                }

            default:
                _logger.LogWarning("Unknown provider for subscription: {Provider}", emailTriggerModel.Provider);
                return serviceResponse;
        }
    }

    private async Task<string?> GetM365AccessTokenAsync(string credentialName)
    {
        try
        {
            // Step 1: Get credentials from vault (by name, scoped to the current tenant)
            var vaultCredential = await GetVaultCredentialAsync(credentialName);
            if (vaultCredential == null)
            {
                _logger.LogWarning("No credential found with Name: {CredentialName} for M365", credentialName);
                return null;
            }

            // Step 2: Validate required credential fields
            if (vaultCredential.Data["AzureTenantId"] == null ||
                vaultCredential.Data["ClientId"] == null ||
                vaultCredential.Data["ClientSecret"] == null)
            {
                _logger.LogWarning("One or more required credential fields are missing for Credential: {CredentialName}", credentialName);
                return null;
            }

            // Step 3: Create request body. It has to be in Dictionary<string, string> format for FormUrlEncodedContent
            var postObj = new Dictionary<string, string>
            {
                { "client_id", vaultCredential.Data["ClientId"].ToString()! },
                { "scope", "https://graph.microsoft.com/.default" },
                { "client_secret", vaultCredential.Data["ClientSecret"].ToString()! },
                { "grant_type", "client_credentials" }
            };

            // Step 4: Send POST request to get token
            var jsonDocument = await HttpClientHelper.PostAsync(
                url: $"https://login.microsoftonline.com/{vaultCredential.Data["AzureTenantId"]}/oauth2/v2.0/token",
                content: postObj,
                mediaType: "application/x-www-form-urlencoded");

            // Step 5: Extract access token
            var accessToken = jsonDocument.RootElement.GetProperty("access_token").GetString();
            if (accessToken == null)
            {
                _logger.LogWarning("Failed to obtain M365 access token for Credential: {CredentialName}", credentialName);
                return null;
            }

            // Step 6: Return access token
            return accessToken;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return null;
        }
    }

    private async Task<VaultCredentialObj?> GetVaultCredentialAsync(string credentialName)
    {
        try
        {
            // Fetch the credential entity along with its encrypted key-value pairs.
            // Scoped by Name + TenantId (+ EnvType) so the (credential_name, tenant_id)
            // combination resolves the correct, unique credential.
            var vaultCredential = await _unitOfWork.VaultCredentialRepo
                .GetByConditionAsync(w =>
                    w.Name == credentialName &&
                    !w.IsDisabled &&
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .AsNoTracking()
                .Include(i => i.EncryptedKeyValues)
                .FirstOrDefaultAsync();
            if (vaultCredential == null) return null;

            // Decrypt and merge key-value pairs into the VaultCredentialObj's data object
            var decryptedData = new Dictionary<string, string>();
            foreach (var kvp in vaultCredential.EncryptedKeyValues)
            {
                var decryptedValue = _stringEncryptionService.DecryptString(kvp.Value);
                decryptedData[kvp.Name] = decryptedValue;
            }

            // Replace the key-value pairs in the Data property where key matches (if vaultCredential is not null then Data property will not be null)
            var dataDict = new Dictionary<string, object>();
            if (!string.IsNullOrEmpty(vaultCredential.Data))
            {
                dataDict = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(vaultCredential.Data) ?? new Dictionary<string, object>();
            }
            foreach (var kvp in decryptedData)
            {
                if (dataDict.ContainsKey(kvp.Key)) dataDict[kvp.Key] = kvp.Value;
            }

            // Return the VaultCredentialObj
            return new VaultCredentialObj
            {
                Name = vaultCredential.Name,
                Type = vaultCredential.Type,
                Data = dataDict
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving Credential with Name: {CredentialName}", credentialName);
        }

        return null;
    }

    private static StringContent CreateJsonContent(object payload)
    {
        return new StringContent(
            System.Text.Json.JsonSerializer.Serialize(payload),
            Encoding.UTF8,
            "application/json"
        );
    }

    private string ExtractAndBuildInputJson(JsonElement payload)
    {
        string? messageId = null; // email message id
        string? userId = null;    // user id (mailbox)
        string? resource = null;  // full resource string

        // Graph webhook data is usually inside "value" array
        if (payload.TryGetProperty("value", out var values) && values.GetArrayLength() > 0)
        {
            var item = values[0]; // take first event

            // get resource like users('...')/messages('...')
            if (item.TryGetProperty("resource", out var resourceProp))
            {
                resource = resourceProp.GetString();

                if (!string.IsNullOrEmpty(resource))
                {
                    // Format: Users/{userId}/Messages/{messageId}
                    var parts = resource.Split('/');

                    if (parts.Length >= 4)
                    {
                        userId = parts[1];
                        messageId = parts[3];
                    }
                }
            }

            // get message id directly from resourceData (preferred)
            if (item.TryGetProperty("resourceData", out var resourceData) &&
                resourceData.TryGetProperty("id", out var idProp))
            {
                messageId = idProp.GetString();
            }
        }

        var result = new
        {
            triggeredBy = "email-trigger", // email trigger flag
            resource,   // full resource path
            userId,     // extracted user id
            messageId   // email message id
        };

        return System.Text.Json.JsonSerializer.Serialize(result); // convert to JSON
    }

    // Resolves a credential NAME to its entity ID. If a name is supplied it takes precedence;
    // otherwise the explicitly provided ID is returned unchanged.
    private async Task<Guid> ResolveCredentialIdAsync(string? credentialName, Guid existingCredentialId)
    {
        if (string.IsNullOrWhiteSpace(credentialName))
            return existingCredentialId;

        var credential = await _unitOfWork.VaultCredentialRepo
            .GetByConditionAsync(w => w.Name == credentialName && w.EnvType == _currentTenantService.CurrentEnvType)
            .FirstOrDefaultAsync();

        return credential?.Id ?? existingCredentialId;
    }
}

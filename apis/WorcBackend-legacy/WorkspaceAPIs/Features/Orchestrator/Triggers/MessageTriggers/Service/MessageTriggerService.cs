namespace WorkspaceAPIs.Services;

public class MessageTriggerService : IMessageTriggerService
{
    private readonly ILogger<MessageTriggerService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly IStringEncryptionService _stringEncryptionService;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IJobsExecutorService _jobsExecutorService;
    private readonly WorkspaceInternalDbContext _workspaceInternalDbContext;
    private readonly IResourceUserAccessService _resourceUserAccessService;
    private readonly ICurrentTenantService _currentTenantService;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private const int MESSAGE_EXPIRY_MINUTES = 4320;

    public MessageTriggerService(
        ILogger<MessageTriggerService> logger,
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

    // Retrieves all message triggers.
    public async Task<ServiceResponse<IEnumerable<MessageTriggerDto>>> GetMessageTriggerListAsync(bool isPersonal)
    {
        // Initialize response with failure defaults
        var serviceResponse = new ServiceResponse<IEnumerable<MessageTriggerDto>>
        {
            Data = null,
            Message = "Failed to retrieve message triggers. Please try again."
        };

        try
        {
            List<Trigger> messageTriggers = new();
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccess = new();

            if (isPersonal)
            {
                // Retrieve owned triggers only
                messageTriggers = await _unitOfWork.TriggerRepo
                    .GetByConditionAsync(w =>
                        w.TriggerType == TriggerTypesEnum.Message &&
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

                // Retrieve tenant-wide or explicitly shared message triggers
                messageTriggers = await _unitOfWork.TriggerRepo
                    .GetByConditionAsync(w =>
                        w.TriggerType == TriggerTypesEnum.Message &&
                        w.CreatedByUserId != _userId &&
                        w.EnvType == _currentTenantService.CurrentEnvType &&
                        (
                            w.IsTenantWideAccess || resourceAccess.Keys.Contains(w.Id)
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
            var messageTriggerDtoList = messageTriggers.Adapt<List<MessageTriggerDto>>();

            // Assign access levels:
            // - Personal triggers are always owned by the current user.
            // - Shared/tenant-wide triggers use granted permissions, defaulting to View.
            messageTriggerDtoList.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);
            });

            serviceResponse.Data = messageTriggerDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Message triggers retrieved successfully";
        }
        catch (Exception ex)
        {
            // Log unexpected errors during retrieval
            _logger.LogError(ex, "An error occurred while retrieving message triggers from the database.");
        }

        return serviceResponse;
    }

    // Retrieves a single message trigger by ID.
    public async Task<ServiceResponse<MessageTriggerDto>> GetMessageTriggerAsync(Guid messageTriggerId)
    {
        // Initialize default response
        var serviceResponse = new ServiceResponse<MessageTriggerDto>
        {
            Data = null,
            Message = "Failed to retrieve message trigger. Please try again."
        };

        try
        {
            // Fetch message trigger from the repository
            var messageTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == messageTriggerId && w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Check if the message trigger exists
            if (messageTrigger == null)
            {
                serviceResponse.Message = "Message trigger does not exist";
                return serviceResponse; // Return early if not found
            }

            var (canView, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                messageTrigger.Id,
                ResourceTypeEnum.Trigger,
                messageTrigger.CreatedByUserId,
                messageTrigger.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                serviceResponse.Message = "You do not have access to view this message trigger.";
                return serviceResponse;
            }
            // Map entity to DTO
            serviceResponse.Data = messageTrigger.Adapt<MessageTriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Message trigger retrieved successfully";
        }
        catch (Exception ex)
        {
            // Log error if retrieval fails
            _logger.LogError(ex, "An error occurred while retrieving message trigger with ID {messageTriggerId}", messageTriggerId);
        }

        return serviceResponse;
    }

    // Creates a new message trigger.
    public async Task<ServiceResponse<MessageTriggerDto>> CreateMessageTriggerAsync(MessageTriggerDto messageTriggerDto)
    {
        // Initialize default response with failure state
        var serviceResponse = new ServiceResponse<MessageTriggerDto>
        {
            Data = null,
            Message = "Failed to create message trigger. Please try again."
        };

        try
        {
            // Block creating new message triggers while in the PROD environment.
            var prodBlock = CreateResourceGuard.Validate<MessageTriggerDto>(
                _currentTenantService.CurrentEnvType,
                "message trigger");
            if (prodBlock != null)
            {
                return prodBlock;
            }

            // Validate duplicate trigger by name (case-insensitive)
            var existingTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => 
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == messageTriggerDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (existingTrigger != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Message trigger with the same name already exists.";
                return serviceResponse; // Return early if duplicate found
            }

            if (DateTimeOffset.UtcNow.AddMinutes(MESSAGE_EXPIRY_MINUTES) < messageTriggerDto.ExpiryDateTime)
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = $"Expiry date cannot exceed {MESSAGE_EXPIRY_MINUTES} minutes from now.";
                return serviceResponse;
            }

            // Trim all string properties on the DTO
            messageTriggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(messageTriggerDto);

            // Resolve the credential name to its ID (entity keeps the ID per name-based Agent Builder).
            messageTriggerDto.CredentialId = await ResolveCredentialIdAsync(messageTriggerDto.CredentialName, messageTriggerDto.CredentialId);

            // Convert DTO to Trigger entity
            var newMessageTrigger = messageTriggerDto.Adapt<Trigger>();
            newMessageTrigger.Id = Guid.NewGuid();

            // Serialize MessageTriggerModel properties into Metadata JSON
            var model = (MessageTriggerModel)messageTriggerDto;

            // Generate a random clientState token used to verify Graph webhook notifications
            model.ClientState = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

            // Create new message trigger subscription
            var subscription = await ManagemessageTriggerSubscriptionAsync(model, "create", newMessageTrigger.Id);

            // creation failed
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

            newMessageTrigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(subscription.Data, jsonOptions));

            // Set the TriggerType explicitly
            newMessageTrigger.TriggerType = TriggerTypesEnum.Message;
            newMessageTrigger.EnvType = _currentTenantService.CurrentEnvType;

            // Set audit fields: created and last modified by current user
            newMessageTrigger.CreatedByUserId = _userId;
            newMessageTrigger.LastModifiedByUserId = _userId;

            // Insert entity into repository
            await _unitOfWork.TriggerRepo.InsertAsync(newMessageTrigger);

            // Save changes to database and validate success
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while creating message trigger with name {messageTriggerName}.", messageTriggerDto.Name);
                return serviceResponse;
            }

            // Assign ownership
            if (!await _resourceUserAccessService.AssignOwnerAsync(_userId, newMessageTrigger.Id, ResourceTypeEnum.Trigger))
            {
                serviceResponse.Message = "Failed assigning ownership.";
                return serviceResponse;
            }

            // Retrieve all agents from the database that are linked to the provided email trigger DTO.
            // Only include agents whose IDs are in emailTriggerDto.Agents and are marked as published.
            var agentIds = messageTriggerDto.Agents?
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
                // Create a list of TriggerFlowVersion entities linking the new message trigger to each agent.
                var triggerFlowVersions = agents.Select(agent => new TriggerFlowVersion
                {
                    TriggerId = newMessageTrigger.Id,
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

            newMessageTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == newMessageTrigger.Id)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Map back to DTO for response
            serviceResponse.Data = newMessageTrigger.Adapt<MessageTriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Message trigger created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating message trigger with name {messageTriggerName}.", messageTriggerDto.Name);
        }

        return serviceResponse;
    }

    // Updates an existing message trigger.
    public async Task<ServiceResponse<MessageTriggerDto>> UpdateMessageTriggerAsync(MessageTriggerDto messageTriggerDto)
    {
        // Initialize default response with failure
        var serviceResponse = new ServiceResponse<MessageTriggerDto>
        {
            Data = null,
            Message = "Failed to update message trigger. Please try again."
        };

        try
        {
            // Retrieve existing message trigger
            var messageTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == messageTriggerDto.Id && w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.TriggerFlowVersions)
                .SingleOrDefaultAsync();

            // Validate existence
            if (messageTrigger == null)
            {
                serviceResponse.Message = "Message trigger does not exist";
                return serviceResponse; // Early return
            }

            // Require OM for PROD edits based on the persisted trigger environment.
            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<MessageTriggerDto>(
                messageTrigger.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "message trigger");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            var (canEdit, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                messageTrigger.Id,
                ResourceTypeEnum.Trigger,
                messageTrigger.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                serviceResponse.Message = "You do not have access to update this message trigger.";
                return serviceResponse;
            }

            // Check for duplicate name among other triggers
            var duplicateTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == messageTriggerDto.Name.ToLower() &&
                    w.Id != messageTriggerDto.Id &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .FirstOrDefaultAsync();

            if (duplicateTrigger != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Message trigger with the same name already exists.";
                return serviceResponse;
            }

            // Normalize input (trim all string properties)
            messageTriggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(messageTriggerDto);

            // Resolve the credential name to its ID (entity keeps the ID per name-based Agent Builder).
            if (!string.IsNullOrWhiteSpace(messageTriggerDto.CredentialName))
            {
                messageTriggerDto.CredentialId = await ResolveCredentialIdAsync(messageTriggerDto.CredentialName, messageTriggerDto.CredentialId);
            }

            // Validate ExpiryDateTime cannot be reduced
            if (messageTrigger.Metadata.RootElement.TryGetProperty("expiryDateTime", out var existingExpiryElement))
            {
                var existingExpiry = existingExpiryElement.GetDateTime();

                if (messageTriggerDto.ExpiryDateTime < existingExpiry)
                {
                    serviceResponse.StatusCode = 400;
                    serviceResponse.Message = "Expiry date cannot be earlier than the existing expiry date.";
                    return serviceResponse;
                }
            }

            if (DateTimeOffset.UtcNow.AddMinutes(MESSAGE_EXPIRY_MINUTES) <= messageTriggerDto.ExpiryDateTime)
            {
                serviceResponse.StatusCode = 400;
                serviceResponse.Message = $"Expiry date cannot exceed {MESSAGE_EXPIRY_MINUTES} minutes from now.";
                return serviceResponse;
            }

            // Update basic fields
            messageTrigger.Timezone = messageTriggerDto.Timezone;

            // JSON serializer configuration
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };

            // Deserialize existing metadata into model
            var model = System.Text.Json.JsonSerializer.Deserialize<MessageTriggerModel>(
                messageTrigger.Metadata.RootElement.GetRawText(),
                jsonOptions);

            // Preserve existing subscriptionId and update related fields
            if (messageTrigger.Metadata.RootElement.TryGetProperty("subscriptionId", out var subId))
            {
                model.SubscriptionId = subId.GetString();
                model.ResubscribeEnabled = messageTriggerDto.ResubscribeEnabled;
                model.ExpiryDateTime = messageTriggerDto.ExpiryDateTime;
                model.ResubscribeFrequency = messageTriggerDto.ResubscribeFrequency;
            }

            // Call external/internal service to manage subscription update
            var subscription = await ManagemessageTriggerSubscriptionAsync(model, "update", messageTriggerDto.Id);

            // Handle subscription failure
            if (subscription.StatusCode != 200)
            {
                serviceResponse.Message = subscription.Message;
                return serviceResponse;
            }

            // Ensure enums are serialized as strings
            jsonOptions.Converters.Add(new JsonStringEnumConverter());

            // Update metadata with latest subscription data
            messageTrigger.Metadata = JsonDocument.Parse(
                System.Text.Json.JsonSerializer.Serialize(subscription.Data, jsonOptions)
            );

            // Set audit fields to track who last modified the trigger
            messageTrigger.LastModifiedByUserId = _userId;

            // Persist changes to repository
            _unitOfWork.TriggerRepo.Update(messageTrigger);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while updating message trigger with ID {messageTriggerId}.", messageTriggerDto.Id);
                return serviceResponse;
            }

            // TODO: ENABLE TRIGGER FLOW VERSION SYNC IF AGENT MAPPING IS USED
            // // =========================
            // // SYNC TRIGGER FLOW VERSIONS (WITH CHANGE DETECTION)
            // // =========================

            // // Track whether any changes were made
            // var hasChanges = false;

            // // Extract agent IDs from request
            // var requestedAgentIds = messageTriggerDto.Agents?
            //     .Select(a => a.Id)
            //     .ToHashSet() ?? new HashSet<Guid>();

            // // Existing mappings from DB
            // var existingMappings = messageTrigger.TriggerFlowVersions ?? new List<TriggerFlowVersion>();

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
            //             TriggerId = messageTrigger.Id,
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
            //         _logger.LogError("Failed to sync TriggerFlowVersions for message trigger ID {messageTriggerId}.", messageTriggerDto.Id);
            //         return serviceResponse;
            //     }
            // }

            messageTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == messageTrigger.Id)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Map back to DTO for response
            serviceResponse.Data = messageTrigger.Adapt<MessageTriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Message trigger updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while updating message trigger with ID {messageTriggerId}.", messageTriggerDto.Id);
        }

        return serviceResponse;
    }

    // Deletes a single message trigger.
    public async Task<ServiceResponse<bool>> DeleteMessageTriggerAsync(Guid messageTriggerId)
    {
        // Initialize response with failure defaults
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete message trigger. Please try again."
        };

        try
        {
            // Retrieve the message trigger
            var messageTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == messageTriggerId && w.TriggerType == TriggerTypesEnum.Message && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            // Check existence
            if (messageTrigger == null)
            {
                serviceResponse.Message = "Message trigger does not exist";
                return serviceResponse;
            }

            // PROD-guard: block deletion of PROD triggers or triggers with a same-name PROD twin.
            // Checked before the provider unsubscribe so a blocked deletion has no side effects.
            var guardBlock = await DeleteResourceGuard.ValidateAsync(
                _unitOfWork.TriggerRepo,
                messageTrigger.EnvType,
                messageTrigger.Name,
                w => w.Name.ToLower() == messageTrigger.Name.ToLower() &&
                     w.EnvType == ConfigureEnvironmentType.Prod &&
                     w.TenantId == messageTrigger.TenantId &&
                     w.SpaceId == messageTrigger.SpaceId,
                "message trigger");
            if (guardBlock != null)
            {
                return guardBlock;
            }

            var (canDelete, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                messageTrigger.Id,
                ResourceTypeEnum.Trigger,
                messageTrigger.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                }
            );

            if (!canDelete)
            {
                serviceResponse.Message = "You do not have access to delete this message trigger.";
                return serviceResponse;
            }

            // Configure JSON options first
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };

            // Add the enum converter
            jsonOptions.Converters.Add(new JsonStringEnumConverter());

            // Deserialize the Metadata JSON into MessageTriggerModel
            var model = System.Text.Json.JsonSerializer.Deserialize<MessageTriggerModel>(
                messageTrigger.Metadata.RootElement.GetRawText(),
                jsonOptions
            );

            // Remove message trigger subscription before deletion
            var subscription = await ManagemessageTriggerSubscriptionAsync(model!, "delete", messageTriggerId);

            // deletion failed at provider level
            if (subscription.StatusCode != 200)
            {
                serviceResponse.Message = subscription.Message;
                return serviceResponse;
            }

            await _resourceUserAccessService.DeleteResourceUserAccessesAsync(messageTrigger.Id, ResourceTypeEnum.Trigger);

            // Delete entity
            _unitOfWork.TriggerRepo.Delete(messageTrigger);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while deleting message trigger with ID {messageTriggerId}.", messageTriggerId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Message trigger deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while deleting message trigger with ID {messageTriggerId}.", messageTriggerId);
        }

        return serviceResponse;
    }

    // Deletes multiple message triggers.
    public async Task<ServiceResponse<bool>> DeleteMessageTriggersAsync(IEnumerable<Guid> messageTriggerIds)
    {
        // Initialize response with default failure
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete message triggers. Please try again."
        };

        try
        {
            // Retrieve triggers that match provided IDs
            var messageTriggers = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => messageTriggerIds.Contains(w.Id) && w.TriggerType == TriggerTypesEnum.Message && w.EnvType == _currentTenantService.CurrentEnvType)
                .ToListAsync();

            // Check if any triggers were found
            if (messageTriggers == null || messageTriggers.Count == 0)
            {
                serviceResponse.Message = "Message triggers not found";
                return serviceResponse;
            }

            // PROD-guard: block the whole batch if any trigger is PROD or has a same-name PROD twin.
            // Checked before the provider unsubscribe so a blocked deletion has no side effects.
            var blockedNames = new List<string>();
            foreach (var messageTrigger in messageTriggers)
            {
                var guardBlock = await DeleteResourceGuard.ValidateAsync(
                    _unitOfWork.TriggerRepo,
                    messageTrigger.EnvType,
                    messageTrigger.Name,
                    w => w.Name.ToLower() == messageTrigger.Name.ToLower() &&
                         w.EnvType == ConfigureEnvironmentType.Prod &&
                         w.TenantId == messageTrigger.TenantId &&
                         w.SpaceId == messageTrigger.SpaceId,
                    "message trigger");
                if (guardBlock != null)
                {
                    blockedNames.Add(messageTrigger.Name);
                }
            }

            if (blockedNames.Count > 0)
            {
                serviceResponse.Message =
                    $"Cannot delete the following message trigger(s) because they are published (PROD) or have a same-name PROD version: {string.Join(", ", blockedNames)}";
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
            foreach (var messageTrigger in messageTriggers)
            {
                var model = System.Text.Json.JsonSerializer.Deserialize<MessageTriggerModel>(
                    messageTrigger.Metadata.RootElement.GetRawText(),
                    jsonOptions
                );

                if (model != null)
                {
                    // Remove message trigger subscription before deletion
                    var subscription = await ManagemessageTriggerSubscriptionAsync(model!, "delete", messageTrigger.Id);

                    // deletion failed at provider level
                    if (subscription.StatusCode != 200)
                    {
                        serviceResponse.Message = subscription.Message;
                        return serviceResponse;
                    }
                }
            }

            foreach (var trigger in messageTriggers)
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
                    serviceResponse.Message = "You do not have access to delete one or more message triggers.";
                    return serviceResponse;
                }
            }

            await _resourceUserAccessService.DeleteResourceUserAccessesAsync(messageTriggerIds, ResourceTypeEnum.Trigger);

            // Delete triggers
            _unitOfWork.TriggerRepo.Delete(messageTriggers);

            // Persist deletion
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while deleting multiple message triggers.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{messageTriggers.Count} message triggers deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while deleting multiple message triggers.");
        }

        return serviceResponse;
    }

    // Checks if an message trigger name is available.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsMessageTriggerNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize response with default failure
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check message trigger name availability. Please try again."
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
                serviceResponse.Message = "Message trigger name already exists";
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                return serviceResponse;
            }

            // Name is available
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.Message = "Message trigger name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while checking message trigger name availability for '{messageTriggerName}'.", checkAvailabilityDto.UserInput);
        }

        return serviceResponse;
    }

    // Retrieves agents assigned to an message trigger.
    public async Task<ServiceResponse<IEnumerable<AssignAgentTriggerDto>>> GetAgentsByMessageTriggerAsync(Guid messageTriggerId)
    {
        // Initialize response with default failure
        var serviceResponse = new ServiceResponse<IEnumerable<AssignAgentTriggerDto>>
        {
            Data = null,
            Message = "Failed to retrieve agents. Please try again."
        };

        try
        {
            // Retrieve all flows associated with this message trigger
            var triggerFlows = await _unitOfWork.TriggerFlowVersionRepo
                .GetByConditionAsync(w => w.TriggerId == messageTriggerId)
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
            _logger.LogError(ex, "An error occurred while retrieving agents for message trigger ID {messageTriggerId}.", messageTriggerId);
        }

        return serviceResponse;
    }

    // Creates jobs for all flow versions associated with the given trigger ID.
    public async Task<ServiceResponse<bool>> CreateJobByMessageTriggerIdAsync(string triggerId, JsonElement payload)
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
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
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
                    SpaceId = triggerFlowVersion.FlowVersion.SpaceId ?? triggerFlowVersion.FlowVersion.Flow?.SpaceId ?? trigger.SpaceId,
                    FlowVersionId = triggerFlowVersion.FlowVersionId,
                    TriggerType = trigger.TriggerType,
                    InputArgumentsJson = ExtractAndBuildInputJson(payload),
                    MachineId = null,
                    Priority = JobPriorityEnum.Normal,
                    Status = JobStatusEnum.Created,
                    IsPublished = triggerFlowVersion.FlowVersion.IsPublished,
                };

                await _unitOfWork.ExecuteInTransactionAsync(async () =>
                {
                    await _unitOfWork.AcquireAdvisoryLockAsync(FlowVersionHistoryHelpers.HistoryLockKey(triggerFlowVersion.FlowVersionId));

                    newJob.CreatedOn = DateTimeOffset.UtcNow;

                    newJob.FlowVersionHistoryId = await _workspaceInternalDbContext.FlowVersionHistories
                        .Where(h => h.FlowVersionId == triggerFlowVersion.FlowVersionId && h.TenantId == triggerFlowVersion.TenantId)
                        .OrderByDescending(h => h.CreatedOn)
                        .ThenByDescending(h => h.Id)
                        .Select(h => (Guid?)h.Id)
                        .FirstOrDefaultAsync();

                    await _unitOfWork.JobRepo.InsertAsync(newJob);

                    if (!await _unitOfWork.SaveAsync())
                        throw new InvalidOperationException("SaveChanges failed while inserting the trigger job.");
                });

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

    private async Task<ServiceResponse<MessageTriggerModel>> ManagemessageTriggerSubscriptionAsync(MessageTriggerModel? messageTriggerModel, string action, Guid triggerId)
    {
        // initialize response with action-based failure message
        var serviceResponse = new ServiceResponse<MessageTriggerModel>
        {
            Data = messageTriggerModel,
            Message = $"Failed to {action} subscription. Please try again."
        };

        // Initialize HttpClient for API requests
        using var httpClient = new HttpClient();

        if (!string.IsNullOrEmpty(messageTriggerModel.Reference))
        {
            var resource = messageTriggerModel.Resource;

            // Split reference by '/'
            var referenceParts = messageTriggerModel.Reference.Split('/');

            // Find all placeholders like {team-id}, {channel-id}
            var matches = Regex.Matches(resource, "{.*?}");

            for (int i = 0; i < matches.Count && i < referenceParts.Length; i++)
            {
                resource = resource.Replace(matches[i].Value, referenceParts[i]);
            }

            messageTriggerModel.Resource = resource;
        }

        // Determine provider (Outlook / Gmail)
        switch (messageTriggerModel.Provider)
        {
            // Handle Microsoft 365 (Outlook) message trigger subscriptions via Graph API
            case TriggerProviderTypesEnum.M365:
                {
                    // Acquire access token for Microsoft Graph
                    var accessToken = await GetM365AccessTokenAsync(messageTriggerModel.CredentialName ?? string.Empty);

                    // Set authorization header for API requests
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
                    httpClient.BaseAddress = new Uri("https://graph.microsoft.com/v1.0/");

                    // Normalize base URL (ensure HTTPS and remove trailing slash)
                    var baseUrl = _environmentConfig.AppBaseUrl?.Trim().TrimEnd('/');
                    if (!baseUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                        baseUrl = "https://" + baseUrl;

                    // Endpoint to receive Graph change notifications
                    var notificationUrl = $"{baseUrl}/workspace/api/message-trigger/notify/{triggerId}";

                    // Check if subscription has expired and adjust actions accordingly
                    if (messageTriggerModel.ExpiryDateTime <= DateTimeOffset.UtcNow)
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

                    // Execute action: create (new), update (renew), delete (remove)
                    switch (action.ToLower())
                    {
                        case "create":
                            // Build subscription payload for message creation events
                            var subscriptionRequest = new
                            {
                                changeType = "created",
                                notificationUrl = notificationUrl,
                                lifecycleNotificationUrl = notificationUrl,
                                resource = messageTriggerModel.Resource,
                                expirationDateTime = messageTriggerModel.ExpiryDateTime.UtcDateTime.ToString("o"),
                                clientState = messageTriggerModel.ClientState
                            };

                            // Send subscription creation request
                            var postRequest = new HttpRequestMessage(HttpMethod.Post, "subscriptions")
                            {
                                Content = CreateJsonContent(subscriptionRequest)
                            };

                            response = await httpClient.SendAsync(postRequest);

                            // Capture subscription ID for future update/delete operations
                            if (response.IsSuccessStatusCode)
                            {
                                var responseContent = await response.Content.ReadAsStringAsync();
                                using var doc = JsonDocument.Parse(responseContent);

                                if (doc.RootElement.TryGetProperty("id", out var subscriptionIdProperty))
                                {
                                    messageTriggerModel.SubscriptionId = subscriptionIdProperty.GetString();
                                }
                            }
                            break;

                        case "update":
                            // Renew subscription (Graph only allows expiration + notification URL update)
                            var updateRequest = new
                            {
                                expirationDateTime = messageTriggerModel.ExpiryDateTime.UtcDateTime.ToString("o"),
                                notificationUrl = notificationUrl
                            };

                            var patchRequest = new HttpRequestMessage(HttpMethod.Patch, $"subscriptions/{messageTriggerModel.SubscriptionId}")
                            {
                                Content = CreateJsonContent(updateRequest)
                            };

                            response = await httpClient.SendAsync(patchRequest);
                            break;

                        case "delete":
                            // Remove existing subscription from Graph
                            response = await httpClient.DeleteAsync(
                                $"subscriptions/{messageTriggerModel.SubscriptionId}");
                            break;

                        default:
                            // Guard against unsupported actions
                            _logger.LogWarning("Unknown action for M365 subscription: {Action}", action);
                            return serviceResponse;
                    }

                    // Handle failure and extract Graph error message if available
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
                            // Fallback to raw response if parsing fails
                            serviceResponse.Message = responseContent;
                        }

                        return serviceResponse;
                    }

                    // Success response
                    serviceResponse.StatusCode = 200;
                    serviceResponse.Message = $"M365 subscription {action} successful.";
                    serviceResponse.Data = messageTriggerModel;

                    return serviceResponse;
                }

            case TriggerProviderTypesEnum.Google:
                // -------------------------------
                // Gmail subscription using Gmail Push API
                // -------------------------------
                {
                    // Build request body
                    var gmailRequest = new
                    {
                        labelIds = "labelIds",
                        topicName = "projects/your-project/topics/message-trigger-topic"
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
                                $"https://gmail.googleapis.com/gmail/v1/users/{messageTriggerModel}/watch",
                                content
                            );
                            break;

                        case "delete":
                            response = await httpClient.PostAsync(
                                $"https://gmail.googleapis.com/gmail/v1/users/{messageTriggerModel}/stop",
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
                _logger.LogWarning("Unknown provider for subscription: {Provider}", messageTriggerModel.Provider);
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
        string? messageId = null; // will store message id
        string? chatId = null;    // will store chat id
        string? resource = null;  // will store full resource string

        // Graph webhook data is usually inside "value" array
        if (payload.TryGetProperty("value", out var values) && values.GetArrayLength() > 0)
        {
            var item = values[0]; // take first event

            // get resource string like chats('...')/messages('...')
            if (item.TryGetProperty("resource", out var resourceProp))
            {
                resource = resourceProp.GetString();

                if (!string.IsNullOrEmpty(resource))
                {
                    // Regex pulls value inside chats('...')
                    var chatMatch = Regex.Match(resource, @"chats\('([^']+)'\)");
                    if (chatMatch.Success)
                        chatId = chatMatch.Groups[1].Value;

                    // Regex pulls value inside messages('...')
                    var msgMatch = Regex.Match(resource, @"messages\('([^']+)'\)");
                    if (msgMatch.Success)
                        messageId = msgMatch.Groups[1].Value;
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
            triggeredBy = "message-trigger", // custom flag
            resource,   // full resource path
            chatId,     // extracted chat id
            messageId   // extracted message id
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

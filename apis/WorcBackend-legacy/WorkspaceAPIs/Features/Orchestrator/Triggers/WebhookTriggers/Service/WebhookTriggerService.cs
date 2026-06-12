namespace WorkspaceAPIs.Services;

public class WebhookTriggerService : IWebhookTriggerService
{
    private readonly ILogger<WebhookTriggerService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IResourceShareService _resourceShareService;

    public WebhookTriggerService(
        ILogger<WebhookTriggerService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        EnvironmentConfig environmentConfig,
        IResourceShareService resourceShareService)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _environmentConfig = environmentConfig;
        _resourceShareService = resourceShareService;
    }

    // Retrieves all webhook triggers.
    public async Task<ServiceResponse<IEnumerable<WebhookTriggerDto>>> GetWebhookTriggerListAsync(bool isPersonal)
    {
        var serviceResponse = new ServiceResponse<IEnumerable<WebhookTriggerDto>>
        {
            Data = null,
            Message = "Failed to retrieve webhook triggers. Please try again."
        };

        try
        {
            List<Trigger> triggers = new();
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccess = new();

            if (isPersonal)
            {
                // Retrieve only owned webhook triggers
                triggers = await _unitOfWork.TriggerRepo
                    .GetByConditionAsync(w =>
                        w.TriggerType == TriggerTypesEnum.WebhookTrigger &&
                        w.CreatedByUserId == _userId)
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
                resourceAccess = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _userId,
                    ResourceTypeEnum.Trigger,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.FullAccess,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                        ResourceAccessTypeEnum.Delete
                    }
                );

                // Retrieve tenant-wide or explicitly shared webhook triggers
                triggers = await _unitOfWork.TriggerRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId != _userId &&
                        w.TriggerType == TriggerTypesEnum.WebhookTrigger &&
                        (w.IsTenantWideAccess || resourceAccess.Keys.Contains(w.Id)))
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
            var webhookTriggerDtoList = triggers.Adapt<List<WebhookTriggerDto>>();

            // Assign access levels and generate webhook URLs
            webhookTriggerDtoList.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);

                fe.WebhookUrl = BuildWebhookUrl(fe.Id);
            });
            serviceResponse.Data = webhookTriggerDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Webhook triggers retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving webhook triggers.");
        }

        return serviceResponse;
    }

    // Retrieves a single webhook trigger by ID.
    public async Task<ServiceResponse<WebhookTriggerDto>> GetWebhookTriggerAsync(Guid triggerId)
    {
        var serviceResponse = new ServiceResponse<WebhookTriggerDto>
        {
            Data = null,
            Message = "Failed to retrieve webhook trigger. Please try again."
        };

        try
        {
            var trigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == triggerId && w.TriggerType == TriggerTypesEnum.WebhookTrigger)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            if (trigger == null)
            {
                serviceResponse.Message = "Webhook trigger does not exist";
                return serviceResponse;
            }

            // Validate view permission
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    trigger.Id,
                    ResourceTypeEnum.Trigger,
                    trigger.CreatedByUserId,
                    trigger.IsTenantWideAccess,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.FullAccess,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                        ResourceAccessTypeEnum.Delete,
                    }
                );

            if (!canView)
            {
                serviceResponse.Message = "You do not have access to view this webhook trigger.";
                return serviceResponse;
            }

            var dto = trigger.Adapt<WebhookTriggerDto>();
            dto.WebhookUrl = BuildWebhookUrl(dto.Id);

            serviceResponse.Data = dto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Webhook trigger retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving webhook trigger {TriggerId}.", triggerId);
        }

        return serviceResponse;
    }

    // Creates a new webhook trigger.
    public async Task<ServiceResponse<WebhookTriggerDto>> CreateWebhookTriggerAsync(WebhookTriggerDto dto)
    {
        var serviceResponse = new ServiceResponse<WebhookTriggerDto>
        {
            Data = null,
            Message = "Failed to create webhook trigger. Please try again."
        };

        try
        {
            // Duplicate name check
            var existing = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.TriggerType == TriggerTypesEnum.WebhookTrigger &&
                    w.Name.ToLower() == dto.Name.ToLower())
                .FirstOrDefaultAsync();

            if (existing != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A webhook trigger with the same name already exists.";
                return serviceResponse;
            }

            dto = TrimDtoStringPropsUtil.TrimDtoStringProps(dto);

            // Generate a cryptographically secure API key (shown once)
            var plainApiKey = GenerateApiKey();
            var apiKeyHash = HashApiKey(plainApiKey);

            // Build the metadata model
            var model = new WebhookTriggerModel
            {
                ApiKeyHash = apiKeyHash,
                ExpectedPayloadSchema = dto.ExpectedPayloadSchema,
                CallbackUrl = dto.CallbackUrl,
                ApiKey = dto.ApiKey
            };

            var newTrigger = dto.Adapt<Trigger>();
            newTrigger.TriggerType = TriggerTypesEnum.WebhookTrigger;
            newTrigger.Timezone = string.Empty;
            newTrigger.Metadata = SerializeMetadata(model);
            newTrigger.CreatedByUserId = _userId;
            newTrigger.LastModifiedByUserId = _userId;

            await _unitOfWork.TriggerRepo.InsertAsync(newTrigger);
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed while creating webhook trigger '{Name}'.", dto.Name);
                return serviceResponse;
            }

            // Assign ownership
            if (!await _resourceShareService.AssignOwnerAsync(_userId, newTrigger.Id, ResourceTypeEnum.Trigger))
            {
                serviceResponse.Message = "Failed assigning ownership.";
                return serviceResponse;
            }

            // Extract agent ID from the incoming DTO
            var agentId = dto.Agent?.Id;

            // Fetch the published FlowVersion matching the provided agent ID
            var agent = agentId != null
                ? await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.Id == agentId && w.IsPublished)
                    .FirstOrDefaultAsync()
                : null;

            // Continue only if a matching agent was found
            if (agent != null)
            {
                // Create TriggerFlowVersion mapping between the trigger and the agent
                var triggerFlowVersion = new TriggerFlowVersion
                {
                    TriggerId = newTrigger.Id,
                    FlowVersionId = agent.Id,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                };

                // Persist the mapping
                await _unitOfWork.TriggerFlowVersionRepo.InsertAsync(triggerFlowVersion);

                // Commit changes and log if persistence fails
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to persist TriggerFlowVersion for webhook trigger {TriggerId}.", newTrigger.Id);
                }
            }

            newTrigger = await _unitOfWork.TriggerRepo
                            .GetByConditionAsync(w => w.Id == newTrigger.Id)
                            .Include(i => i.CreatedByUser)
                            .Include(i => i.LastModifiedByUser)
                            .Include(i => i.TriggerFlowVersions)
                                .ThenInclude(i2 => i2.FlowVersion)
                                    .ThenInclude(i3 => i3.Flow)
                            .AsNoTracking()
                            .SingleOrDefaultAsync();

            var resultDto = newTrigger.Adapt<WebhookTriggerDto>();
            resultDto.WebhookUrl = BuildWebhookUrl(newTrigger.Id);
            // Return the plain key once
            resultDto.ApiKey = plainApiKey;
            resultDto.ApiKeyHash = null;

            serviceResponse.Data = resultDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Webhook trigger created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while creating webhook trigger '{Name}'.", dto.Name);
        }

        return serviceResponse;
    }

    // Updates an existing webhook trigger.
    public async Task<ServiceResponse<WebhookTriggerDto>> UpdateWebhookTriggerAsync(WebhookTriggerDto dto)
    {
        var serviceResponse = new ServiceResponse<WebhookTriggerDto>
        {
            Data = null,
            Message = "Failed to update webhook trigger. Please try again."
        };

        try
        {
            var trigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == dto.Id && w.TriggerType == TriggerTypesEnum.WebhookTrigger)
                .Include(i => i.TriggerFlowVersions)
                .SingleOrDefaultAsync();

            if (trigger == null)
            {
                serviceResponse.Message = "Webhook trigger does not exist";
                return serviceResponse;
            }

            // Validate edit permission
            var (canEdit, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                trigger.Id,
                ResourceTypeEnum.Trigger,
                trigger.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                serviceResponse.Message = "You do not have access to update this webhook trigger.";
                return serviceResponse;
            }

            // Duplicate name check among other triggers
            var duplicate = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.TriggerType == TriggerTypesEnum.WebhookTrigger &&
                    w.Name.ToLower() == dto.Name.ToLower() &&
                    w.Id != dto.Id)
                .FirstOrDefaultAsync();

            if (duplicate != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A webhook trigger with the same name already exists.";
                return serviceResponse;
            }

            dto = TrimDtoStringPropsUtil.TrimDtoStringProps(dto);

            // Deserialize existing metadata to preserve the API key hash
            var jsonOptions = BuildJsonOptions();
            var existingModel = System.Text.Json.JsonSerializer.Deserialize<WebhookTriggerModel>(
                trigger.Metadata.RootElement.GetRawText(), jsonOptions);

            // Check if API key changed
            bool isApiKeyChanged = !string.IsNullOrWhiteSpace(dto.ApiKey) &&
                                   dto.ApiKey != existingModel?.ApiKey;

            var updatedModel = new WebhookTriggerModel
            {
                ApiKey = isApiKeyChanged ? dto.ApiKey : existingModel?.ApiKey,
                ApiKeyHash = isApiKeyChanged
                    ? HashApiKey(dto.ApiKey ?? string.Empty)   // generate new hash if changed
                    : existingModel.ApiKeyHash,

                ExpectedPayloadSchema = dto.ExpectedPayloadSchema,
                CallbackUrl = dto.CallbackUrl
            };

            trigger.Name = dto.Name;
            trigger.Timezone = string.Empty;
            trigger.IsDisabled = dto.IsDisabled ?? trigger.IsDisabled;
            trigger.Metadata = SerializeMetadata(updatedModel);
            trigger.LastModifiedByUserId = _userId;

            _unitOfWork.TriggerRepo.Update(trigger);
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed while updating webhook trigger '{Name}'.", dto.Name);
                return serviceResponse;
            }

            // =========================
            // SYNC TRIGGER FLOW VERSIONS (WITH CHANGE DETECTION)
            // =========================

            // Track whether any changes were made
            var hasChanges = false;

            // Extract requested agent ID
            var requestedAgentId = dto.Agent?.Id;

            // Existing mappings from DB
            var existingMappings = trigger.TriggerFlowVersions ?? new List<TriggerFlowVersion>();

            var existingAgentIds = existingMappings
                .Select(tfv => tfv.FlowVersionId)
                .ToHashSet();

            // ----------- ADD NEW MAPPING -----------
            if (requestedAgentId != null && !existingAgentIds.Contains(requestedAgentId.Value))
            {
                var agent = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.Id == requestedAgentId && w.IsPublished)
                    .FirstOrDefaultAsync();

                if (agent != null)
                {
                    var newMapping = new TriggerFlowVersion
                    {
                        TriggerId = trigger.Id,
                        FlowVersionId = agent.Id,
                        CreatedByUserId = _userId,
                        LastModifiedByUserId = _userId
                    };

                    await _unitOfWork.TriggerFlowVersionRepo.InsertAsync(newMapping);
                    hasChanges = true;
                }
            }

            // ----------- REMOVE OLD MAPPINGS -----------
            if (requestedAgentId == null || existingAgentIds.Any(id => id != requestedAgentId))
            {
                var mappingsToDelete = existingMappings
                    .Where(w => requestedAgentId == null || w.FlowVersionId != requestedAgentId)
                    .ToList();

                if (mappingsToDelete.Any())
                {
                    _unitOfWork.TriggerFlowVersionRepo.Delete(mappingsToDelete);
                    hasChanges = true;
                }
            }


            // ----------- SAVE ONLY IF CHANGED -----------
            if (hasChanges)
            {
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to sync TriggerFlowVersions for webhook trigger ID {webhookTriggerId}.", trigger.Id);
                    return serviceResponse;
                }
            }

            trigger = await _unitOfWork.TriggerRepo
                            .GetByConditionAsync(w => w.Id == trigger.Id)
                            .Include(i => i.CreatedByUser)
                            .Include(i => i.LastModifiedByUser)
                            .Include(i => i.TriggerFlowVersions)
                                .ThenInclude(i2 => i2.FlowVersion)
                                    .ThenInclude(i3 => i3.Flow)
                            .AsNoTracking()
                            .SingleOrDefaultAsync();

            var resultDto = trigger.Adapt<WebhookTriggerDto>();
            resultDto.WebhookUrl = BuildWebhookUrl(trigger.Id);

            serviceResponse.Data = resultDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Webhook trigger updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating webhook trigger {TriggerId}.", dto.Id);
        }

        return serviceResponse;
    }

    // Deletes a single webhook trigger.
    public async Task<ServiceResponse<bool>> DeleteWebhookTriggerAsync(Guid triggerId)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete webhook trigger. Please try again."
        };

        try
        {
            var trigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == triggerId && w.TriggerType == TriggerTypesEnum.WebhookTrigger)
                .SingleOrDefaultAsync();

            if (trigger == null)
            {
                serviceResponse.Message = "Webhook trigger does not exist";
                return serviceResponse;
            }

            // Validate delete permission
            var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                trigger.Id,
                ResourceTypeEnum.Trigger,
                trigger.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
                    ResourceAccessTypeEnum.Delete,
                }
            );

            if (!canDelete)
            {
                serviceResponse.Message = "You do not have access to delete this webhook trigger.";
                return serviceResponse;
            }

            // Remove resource shares
            await _resourceShareService
                .DeleteResourceSharesAsync(
                    trigger.Id,
                    ResourceTypeEnum.Trigger);

            _unitOfWork.TriggerRepo.Delete(trigger);
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed while deleting webhook trigger {TriggerId}.", triggerId);
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Webhook trigger deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting webhook trigger {TriggerId}.", triggerId);
        }

        return serviceResponse;
    }

    // Deletes multiple webhook triggers.
    public async Task<ServiceResponse<bool>> DeleteWebhookTriggersAsync(IEnumerable<Guid> triggerIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete webhook triggers. Please try again."
        };

        try
        {
            var triggers = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(t => triggerIds.Contains(t.Id) && t.TriggerType == TriggerTypesEnum.WebhookTrigger)
                .ToListAsync();

            if (triggers == null || triggers.Count == 0)
            {
                serviceResponse.Message = "Webhook triggers not found";
                return serviceResponse;
            }

            foreach (var trigger in triggers)
            {
                var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    trigger.Id,
                    ResourceTypeEnum.Trigger,
                    trigger.CreatedByUserId,
                    false,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.FullAccess,
                        ResourceAccessTypeEnum.Delete,
                    }
                );

                if (!canDelete)
                {
                    serviceResponse.Message = "You do not have access to delete one or more webhook triggers.";
                    return serviceResponse;
                }
            }

            // Remove access mappings
            await _resourceShareService.DeleteResourceSharesAsync(triggerIds, ResourceTypeEnum.Trigger);

            _unitOfWork.TriggerRepo.Delete(triggers);
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed while deleting multiple webhook triggers.");
                return serviceResponse;
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{triggers.Count} webhook trigger(s) deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting multiple webhook triggers.");
        }

        return serviceResponse;
    }

    // Checks if a webhook trigger name is available.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsWebhookTriggerNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check webhook trigger name availability. Please try again."
        };

        try
        {
            var exists = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.TriggerType == TriggerTypesEnum.WebhookTrigger &&
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                .FirstOrDefaultAsync();

            if (exists != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Webhook trigger name already exists";
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                return serviceResponse;
            }

            serviceResponse.StatusCode = 200;
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.Message = "Webhook trigger name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while checking webhook trigger name availability.");
        }

        return serviceResponse;
    }

    // Regenerates the API key for a webhook trigger. Returns the plain key once.
    public async Task<ServiceResponse<WebhookTriggerDto>> RegenerateApiKeyAsync(Guid triggerId)
    {
        var serviceResponse = new ServiceResponse<WebhookTriggerDto>
        {
            Data = null,
            Message = "Failed to regenerate API key. Please try again."
        };

        try
        {
            var trigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == triggerId && w.TriggerType == TriggerTypesEnum.WebhookTrigger)
                .SingleOrDefaultAsync();

            if (trigger == null)
            {
                serviceResponse.Message = "Webhook trigger does not exist";
                return serviceResponse;
            }

            // Validate edit permission
            var (canEdit, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                trigger.Id,
                ResourceTypeEnum.Trigger,
                trigger.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.FullAccess,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                serviceResponse.Message = "You do not have access to generate api key this webhook trigger.";
                return serviceResponse;
            }

            var jsonOptions = BuildJsonOptions();
            var model = System.Text.Json.JsonSerializer.Deserialize<WebhookTriggerModel>(
                trigger.Metadata.RootElement.GetRawText(), jsonOptions) ?? new WebhookTriggerModel();

            var plainApiKey = GenerateApiKey();
            model.ApiKeyHash = HashApiKey(plainApiKey);

            trigger.Metadata = SerializeMetadata(model);
            trigger.LastModifiedByUserId = _userId;

            _unitOfWork.TriggerRepo.Update(trigger);
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed while regenerating API key for trigger {TriggerId}.", triggerId);
                return serviceResponse;
            }

            var resultDto = trigger.Adapt<WebhookTriggerDto>();
            resultDto.WebhookUrl = BuildWebhookUrl(trigger.Id);
            resultDto.ApiKey = plainApiKey;
            resultDto.ApiKeyHash = null;

            serviceResponse.Data = resultDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "API key regenerated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while regenerating API key for trigger {TriggerId}.", triggerId);
        }

        return serviceResponse;
    }

    // Retrieves the agent linked to a webhook trigger.
    public async Task<ServiceResponse<AssignAgentTriggerDto>> GetAgentByWebhookTriggerAsync(Guid triggerId)
    {
        var serviceResponse = new ServiceResponse<AssignAgentTriggerDto>
        {
            Data = null,
            Message = "Failed to retrieve agent. Please try again."
        };

        try
        {
            var triggerFlow = await _unitOfWork.TriggerFlowVersionRepo
                .GetByConditionAsync(w => w.TriggerId == triggerId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (triggerFlow?.FlowVersion == null)
            {
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "No agent linked to this webhook trigger";
                serviceResponse.Data = null;
                return serviceResponse;
            }

            serviceResponse.Data = triggerFlow.Adapt<AssignAgentTriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Agent retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving agent for trigger {TriggerId}.", triggerId);
        }

        return serviceResponse;
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private static string GenerateApiKey()
        => Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));

    internal static string HashApiKey(string plainKey)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(plainKey));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private string BuildWebhookUrl(Guid triggerId)
        => $"{_environmentConfig.AppBaseUrl.TrimEnd('/')}/api/webhook-trigger/notify/{triggerId}";

    private static JsonDocument SerializeMetadata(WebhookTriggerModel model)
    {
        var jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            WriteIndented = false
        };
        jsonOptions.Converters.Add(new JsonStringEnumConverter());
        return JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(model, jsonOptions));
    }

    private static JsonSerializerOptions BuildJsonOptions()
    {
        var opts = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
        };
        opts.Converters.Add(new JsonStringEnumConverter());
        return opts;
    }
}

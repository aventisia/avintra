namespace WorkspaceAPIs.Services;

public class WebhookTriggerService : IWebhookTriggerService
{
    private readonly ILogger<WebhookTriggerService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly EnvironmentConfig _environmentConfig;

    public WebhookTriggerService(
        ILogger<WebhookTriggerService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        EnvironmentConfig environmentConfig)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _environmentConfig = environmentConfig;
    }

    // Retrieves all webhook triggers.
    public async Task<ServiceResponse<IEnumerable<WebhookTriggerDto>>> GetWebhookTriggerListAsync()
    {
        var serviceResponse = new ServiceResponse<IEnumerable<WebhookTriggerDto>>
        {
            Data = null,
            Message = "Failed to retrieve webhook triggers. Please try again."
        };

        try
        {
            var triggers = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.TriggerType == TriggerTypesEnum.WebhookTrigger)
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .ToListAsync();

            var dtos = triggers.Adapt<IEnumerable<WebhookTriggerDto>>();

            // Stamp the webhook URL on each DTO
            foreach (var dto in dtos)
                dto.WebhookUrl = BuildWebhookUrl(dto.Id);

            serviceResponse.Data = dtos;
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
                ApiKeyExpiryDays = dto.ApiKeyExpiryDays,
                ApiKeyExpiry = dto.ApiKeyExpiry,
                ExpectedPayloadSchema = dto.ExpectedPayloadSchema,
                CallbackUrl = dto.CallbackUrl,
                ApiKey = dto.ApiKey
            };

            var newTrigger = dto.Adapt<Trigger>();
            newTrigger.TriggerType = TriggerTypesEnum.WebhookTrigger;
            newTrigger.Metadata = SerializeMetadata(model);
            newTrigger.CreatedByUserId = _userId;
            newTrigger.LastModifiedByUserId = _userId;

            await _unitOfWork.TriggerRepo.InsertAsync(newTrigger);
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed while creating webhook trigger '{Name}'.", dto.Name);
                return serviceResponse;
            }

            // Retrieve all agents from the database that are linked to the provided email trigger DTO.
            // Only include agents whose IDs are in emailTriggerDto.Agents and are marked as published.
            var agentIds = dto.Agents?
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
                    TriggerId = newTrigger.Id,
                    FlowVersionId = agent.Id,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                }).ToList();

                // Insert the new TriggerFlowVersion entries into the repository.
                await _unitOfWork.TriggerFlowVersionRepo.InsertAsync(triggerFlowVersions);

                // Save changes to the database and check if the operation succeeded.
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

            var updatedModel = new WebhookTriggerModel
            {
                ApiKeyHash = existingModel?.ApiKeyHash,           // preserve existing hash
                ApiKeyExpiryDays = dto.ApiKeyExpiryDays,
                ApiKeyExpiry = dto.ApiKeyExpiry,
                ExpectedPayloadSchema = dto.ExpectedPayloadSchema,
                CallbackUrl = dto.CallbackUrl
            };

            trigger.Name = dto.Name;
            trigger.Timezone = dto.Timezone;
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

            // Extract agent IDs from request
            var requestedAgentIds = dto.Agents?
                .Select(a => a.Id)
                .ToHashSet() ?? new HashSet<Guid>();

            // Existing mappings from DB
            var existingMappings = trigger.TriggerFlowVersions ?? new List<TriggerFlowVersion>();

            var existingAgentIds = existingMappings
                .Select(tfv => tfv.FlowVersionId)
                .ToHashSet();


            // ----------- ADD NEW MAPPINGS -----------
            // Agents present in request but not in DB
            var agentIdsToAdd = requestedAgentIds.Except(existingAgentIds).ToList();

            if (agentIdsToAdd.Any())
            {
                var agentsToAdd = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => agentIdsToAdd.Contains(w.Id) && w.IsPublished)
                    .ToListAsync();

                if (agentsToAdd.Any())
                {
                    var newMappings = agentsToAdd.Select(agent => new TriggerFlowVersion
                    {
                        TriggerId = trigger.Id,
                        FlowVersionId = agent.Id,
                        CreatedByUserId = _userId,
                        LastModifiedByUserId = _userId
                    }).ToList();

                    await _unitOfWork.TriggerFlowVersionRepo.InsertAsync(newMappings);
                    hasChanges = true;
                }
            }


            // ----------- REMOVE OLD MAPPINGS -----------
            // Agents present in DB but not in request
            var agentIdsToDelete = existingAgentIds.Except(requestedAgentIds).ToList();

            if (agentIdsToDelete.Any())
            {
                var mappingsToDelete = existingMappings
                    .Where(w => agentIdsToDelete.Contains(w.FlowVersionId))
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

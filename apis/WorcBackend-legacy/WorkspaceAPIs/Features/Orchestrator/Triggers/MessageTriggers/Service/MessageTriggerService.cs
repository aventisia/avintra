namespace WorkspaceAPIs.Services;

public class MessageTriggerService : IMessageTriggerService
{
    private readonly ILogger<MessageTriggerService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly IStringEncryptionService _stringEncryptionService;
    private readonly EnvironmentConfig _environmentConfig;

    public MessageTriggerService(
        ILogger<MessageTriggerService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IStringEncryptionService stringEncryptionService,
        EnvironmentConfig environmentConfig)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // Extract user ID from JWT claim or set to Guid.Empty if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _stringEncryptionService = stringEncryptionService;
        _environmentConfig = environmentConfig;
    }

    // Retrieves all message triggers.
    public async Task<ServiceResponse<IEnumerable<MessageTriggerDto>>> GetMessageTriggerListAsync()
    {
        // Initialize response with failure defaults
        var serviceResponse = new ServiceResponse<IEnumerable<MessageTriggerDto>>
        {
            Data = null,
            Message = "Failed to retrieve message triggers. Please try again."
        };

        try
        {
            // Fetch all message triggers ordered by creation date (latest first)
            var messageTriggers = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.TriggerType == TriggerTypesEnum.MessageTrigger)
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .ToListAsync();

            // Map entities to DTOs for client response
            serviceResponse.Data = messageTriggers.Adapt<IEnumerable<MessageTriggerDto>>();
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
                .GetByConditionAsync(w => w.Id == messageTriggerId)
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
                _logger.LogInformation("Message trigger with ID {messageTriggerId} does not exist.", messageTriggerId);
                serviceResponse.Message = "Message trigger does not exist";
                return serviceResponse; // Return early if not found
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
            // Validate duplicate trigger by name (case-insensitive)
            var existingTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.TriggerType == TriggerTypesEnum.MessageTrigger && w.Name.ToLower() == messageTriggerDto.Name.ToLower())
                .FirstOrDefaultAsync();

            if (existingTrigger != null)
            {
                _logger.LogInformation("Message trigger creation failed. Name {messageTriggerName} already exists.", messageTriggerDto.Name);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Message trigger with the same name already exists.";
                return serviceResponse; // Return early if duplicate found
            }

            // Trim all string properties on the DTO
            messageTriggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(messageTriggerDto);

            // Convert DTO to Trigger entity
            var newmessageTrigger = messageTriggerDto.Adapt<Trigger>();
            newmessageTrigger.Id = Guid.NewGuid();

            // Serialize MessageTriggerModel properties into Metadata JSON
            var model = (MessageTriggerModel)messageTriggerDto;

            // Create new message trigger subscription
            var subscription = await ManagemessageTriggerSubscriptionAsync(model, "create", newmessageTrigger.Id);

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

            newmessageTrigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(subscription.Data, jsonOptions));

            // Set the TriggerType explicitly
            newmessageTrigger.TriggerType = TriggerTypesEnum.MessageTrigger;

            // Set audit fields: created and last modified by current user
            newmessageTrigger.CreatedByUserId = _userId;
            newmessageTrigger.LastModifiedByUserId = _userId;

            // Insert entity into repository
            await _unitOfWork.TriggerRepo.InsertAsync(newmessageTrigger);

            // Save changes to database and validate success
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while creating message trigger with name {messageTriggerName}.", messageTriggerDto.Name);
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
                    TriggerId = newmessageTrigger.Id,
                    FlowVersionId = agent.Id,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                }).ToList();

                // Insert the new TriggerFlowVersion entries into the repository.
                await _unitOfWork.TriggerFlowVersionRepo.InsertAsync(triggerFlowVersions);

                // Save changes to the database and check if the operation succeeded.
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Failed to persist TriggerFlowVersion entries for the new message trigger.");
                    return serviceResponse;
                }
            }

            // Map back to DTO for response
            serviceResponse.Data = newmessageTrigger.Adapt<MessageTriggerDto>();
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
                .GetByConditionAsync(w => w.Id == messageTriggerDto.Id)
                .SingleOrDefaultAsync();

            // Validate existence
            if (messageTrigger == null)
            {
                _logger.LogInformation("Update failed. message trigger with ID {messageTriggerId} does not exist.", messageTriggerDto.Id);
                serviceResponse.Message = "Message trigger does not exist";
                return serviceResponse; // Early return
            }

            // Check for duplicate name among other triggers
            var duplicateTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.TriggerType == TriggerTypesEnum.MessageTrigger &&
                    w.Name.ToLower() == messageTriggerDto.Name.ToLower() &&
                    w.Id != messageTriggerDto.Id
                )
                .FirstOrDefaultAsync();

            if (duplicateTrigger != null)
            {
                _logger.LogInformation("Update failed. message trigger with name {messageTriggerName} already exists.", messageTriggerDto.Name);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Message trigger with the same name already exists.";
                return serviceResponse;
            }

            // Trim leading/trailing spaces from all string properties in the DTO
            messageTriggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(messageTriggerDto);

            // Cast DTO to MessageTriggerModel to access subscription-specific fields
            var model = (MessageTriggerModel)messageTriggerDto;

            // Update existing message trigger subscription
            var subscription = await ManagemessageTriggerSubscriptionAsync(model, "update", messageTriggerDto.Id);

            if (subscription.StatusCode != 200)
            {
                serviceResponse.Message = subscription.Message;
                return serviceResponse;
            }
            // Serialize messageTriggerModel properties into the Metadata JSON column
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };

            // Ensure enums are stored as strings (not numeric values)
            jsonOptions.Converters.Add(new JsonStringEnumConverter());

            // Assign the serialized Metadata to the entity
            messageTrigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(subscription.Data, jsonOptions));

            // Set audit fields to track who last modified the trigger
            messageTrigger.LastModifiedByUserId = _userId;

            // Persist changes to repository
            _unitOfWork.TriggerRepo.Update(messageTrigger);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while updating message trigger with ID {messageTriggerId}.", messageTriggerDto.Id);
                return serviceResponse;
            }

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
                .GetByConditionAsync(w => w.Id == messageTriggerId)
                .SingleOrDefaultAsync();

            // Check existence
            if (messageTrigger == null)
            {
                _logger.LogInformation("Delete failed. message trigger with ID {messageTriggerId} does not exist.", messageTriggerId);
                serviceResponse.Message = "Message trigger does not exist";
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
                .GetByConditionAsync(t => messageTriggerIds.Contains(t.Id))
                .ToListAsync();

            // Check if any triggers were found
            if (messageTriggers == null || messageTriggers.Count == 0)
            {
                _logger.LogInformation("Delete multiple failed. No message triggers found for provided IDs.");
                serviceResponse.Message = "Message triggers not found";
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
                .GetByConditionAsync(w => w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                .FirstOrDefaultAsync();

            if (triggerExists != null)
            {
                // Duplicate exists
                _logger.LogInformation("Message trigger name '{messageTriggerName}' already exists.", checkAvailabilityDto.UserInput);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Message trigger name already exists";
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                return serviceResponse;
            }

            // Name is available
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.Message = "Message trigger name is available";
            _logger.LogInformation("Message trigger name '{messageTriggerName}' is available.", checkAvailabilityDto.UserInput);
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
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.CreatedByUser)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.LastModifiedByUser)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .ToListAsync();

            // Map FlowVersions to agent DTOs
            var agents = triggerFlows
                .Select(s => s.FlowVersion)
                .ToList();

            var assignedAgents = agents.Adapt<List<AssignAgentTriggerDto>>();

            // Set metadata for DTO
            assignedAgents.ForEach(a =>
            {
                a.IsAssigned = true;
                a.TriggerId = messageTriggerId;
            });

            serviceResponse.Data = assignedAgents;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Agents retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving agents for message trigger ID {messageTriggerId}.", messageTriggerId);
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

        // Check if mailbox is provided
        if (string.IsNullOrEmpty(messageTriggerModel.Mailbox))
        {
            _logger.LogWarning("Invalid mailbox value.");

            serviceResponse.Message = "Mailbox cannot be empty.";
            return serviceResponse;
        }
        // Determine provider (Outlook / Gmail)
        switch (messageTriggerModel.Provider)
        {
            case TriggerProviderTypesEnum.M365:
                // Microsoft 365 / Outlook subscription
                {
                    // Get access token for M365 API
                    var accessToken = await GetM365AccessTokenAsync(messageTriggerModel.CredentialId);

                    // Add Bearer token to HttpClient
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                    var baseUrl = _environmentConfig.AppBaseUrl?.Trim().TrimEnd('/');

                    if (!baseUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                        baseUrl = "https://" + baseUrl;
                    var notificationUrl = $"{baseUrl}/worc/api/webhook/trigger/{triggerId}";

                    // Build subscription request body
                    var subscriptionRequest = new
                    {
                        changeType = "created",
                        notificationUrl = notificationUrl,
                        lifecycleNotificationUrl = notificationUrl,
                        resource = messageTriggerModel.Resource,
                        expirationDateTime = messageTriggerModel.ExpiryDateTime.UtcDateTime.ToString("o"),
                        clientState = messageTriggerModel.ApiKey
                    };

                    // Serialize request body to JSON using System.Text.Json
                    var content = new StringContent(
                        System.Text.Json.JsonSerializer.Serialize(subscriptionRequest),
                        Encoding.UTF8,
                        "application/json"
                    );

                    HttpResponseMessage response;

                    // Determine action: create / update / delete
                    switch (action.ToLower())
                    {
                        case "create":
                            // Create HTTP POST request to Microsoft Graph subscriptions endpoint
                            var postRequest = new HttpRequestMessage(HttpMethod.Post, "https://graph.microsoft.com/v1.0/subscriptions")
                            {
                                // Attach the request body content (JSON payload for subscription creation)
                                Content = content
                            };

                            // Send the request to Microsoft Graph
                            response = await httpClient.SendAsync(postRequest);

                            // Check if the request was successful (status code 200–299)
                            if (response.IsSuccessStatusCode)
                            {
                                // Read response content as JSON
                                var responseContent = await response.Content.ReadAsStringAsync();
                                using var doc = JsonDocument.Parse(responseContent);

                                // Extract the subscription ID from the response
                                if (doc.RootElement.TryGetProperty("id", out var subscriptionIdProperty))
                                {
                                    // Assign the subscription ID to your model or entity
                                    messageTriggerModel.SubscriptionId = subscriptionIdProperty.GetString();
                                }
                            }
                            break;

                        case "update":
                            var patchRequest = new HttpRequestMessage(new HttpMethod("PATCH"),
                                $"https://graph.microsoft.com/v1.0/subscriptions/{messageTriggerModel.SubscriptionId}")
                            {
                                Content = content
                            };
                            response = await httpClient.SendAsync(patchRequest);
                            break;

                        case "delete":
                            response = await httpClient.DeleteAsync($"https://graph.microsoft.com/v1.0/subscriptions/{messageTriggerModel.SubscriptionId}");
                            break;

                        default:
                            _logger.LogWarning("Unknown action for M365 subscription: {Action}", action);
                            return serviceResponse;
                    }

                    // Check API response
                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogError("M365 subscription {Action} failed. StatusCode: {StatusCode}", action, response.StatusCode);
                        var responseContent = await response.Content.ReadAsStringAsync();
                        serviceResponse.Message = responseContent;
                        return serviceResponse;
                    }

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
                                $"https://gmail.googleapis.com/gmail/v1/users/{messageTriggerModel.Mailbox}/watch",
                                content
                            );
                            break;

                        case "delete":
                            response = await httpClient.PostAsync(
                                $"https://gmail.googleapis.com/gmail/v1/users/{messageTriggerModel.Mailbox}/stop",
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

    private async Task<string?> GetM365AccessTokenAsync(Guid credentialId)
    {
        try
        {
            // Step 1: Get credentials from vault
            var vaultCredential = await GetCredentialFromVaultAsync(credentialId);
            if (vaultCredential == null)
            {
                _logger.LogWarning("No credential found with ID: {CredentialId} for M365", credentialId);
                return null;
            }

            // Step 2: Validate required credential fields
            if (vaultCredential.Data["AzureTenantId"] == null ||
                vaultCredential.Data["ClientId"] == null ||
                vaultCredential.Data["ClientSecret"] == null)
            {
                _logger.LogWarning("One or more required credential fields are missing for Credential ID: {CredentialId}", credentialId);
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
                _logger.LogWarning("Failed to obtain M365 access token for Credential ID: {CredentialId}", credentialId);
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

    private async Task<VaultCredentialObj?> GetCredentialFromVaultAsync(Guid credentialId)
    {
        try
        {
            // Fetch the credential entity along with its encrypted key-value pairs
            var vaultCredential = await _unitOfWork.AppSecretRepo
                .GetByConditionAsync(w => w.Id == credentialId && !w.IsDisabled)
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
            _logger.LogError(ex, "An error occurred while retrieving Credential with ID: {CredentialId}", credentialId);
        }

        return null;
    }
}
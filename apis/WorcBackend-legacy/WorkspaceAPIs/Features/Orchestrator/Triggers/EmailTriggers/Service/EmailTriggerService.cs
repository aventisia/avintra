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

    public EmailTriggerService(
        ILogger<EmailTriggerService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IStringEncryptionService stringEncryptionService,
        EnvironmentConfig environmentConfig,
        IJobsExecutorService jobsExecutorService,
        WorkspaceInternalDbContext workspaceInternalDbContext)
    {
        _logger = logger;
        _unitOfWork = unitOfWork;

        // Extract user ID from JWT claim or set to Guid.Empty if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _stringEncryptionService = stringEncryptionService;
        _environmentConfig = environmentConfig;
        _jobsExecutorService = jobsExecutorService;
        _workspaceInternalDbContext = workspaceInternalDbContext;
    }

    // Retrieves all email triggers.
    public async Task<ServiceResponse<IEnumerable<EmailTriggerDto>>> GetEmailTriggerListAsync()
    {
        // Initialize response with failure defaults
        var serviceResponse = new ServiceResponse<IEnumerable<EmailTriggerDto>>
        {
            Data = null,
            Message = "Failed to retrieve email triggers. Please try again."
        };

        try
        {
            // Fetch all email triggers ordered by creation date (latest first)
            var emailTriggers = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.TriggerType == TriggerTypesEnum.EmailTrigger)
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .ToListAsync();

            // Map entities to DTOs for client response
            serviceResponse.Data = emailTriggers.Adapt<IEnumerable<EmailTriggerDto>>();
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
                .GetByConditionAsync(w => w.Id == emailTriggerId)
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
                _logger.LogInformation("Email trigger with ID {EmailTriggerId} does not exist.", emailTriggerId);
                serviceResponse.Message = "Email trigger does not exist";
                return serviceResponse; // Return early if not found
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
            // Validate duplicate trigger by name (case-insensitive)
            var existingTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.TriggerType == TriggerTypesEnum.EmailTrigger &&
                    w.Name.ToLower() == emailTriggerDto.Name.ToLower()
                )
                .FirstOrDefaultAsync();

            if (existingTrigger != null)
            {
                _logger.LogInformation("Email trigger creation failed. Name {EmailTriggerName} already exists.", emailTriggerDto.Name);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Email trigger with the same name already exists.";
                return serviceResponse; // Return early if duplicate found
            }

            // Trim all string properties on the DTO
            emailTriggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(emailTriggerDto);

            // Convert DTO to Trigger entity
            var newEmailTrigger = emailTriggerDto.Adapt<Trigger>();
            newEmailTrigger.Id = Guid.NewGuid();

            // Serialize EmailTriggerModel properties into Metadata JSON
            var model = (EmailTriggerModel)emailTriggerDto;

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
            newEmailTrigger.TriggerType = TriggerTypesEnum.EmailTrigger;

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
                    _logger.LogInformation("Failed to persist TriggerFlowVersion entries for the new email trigger.");
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
                .GetByConditionAsync(w => w.Id == emailTriggerDto.Id)
                .SingleOrDefaultAsync();

            // Validate existence
            if (emailTrigger == null)
            {
                _logger.LogInformation("Update failed. Email trigger with ID {EmailTriggerId} does not exist.", emailTriggerDto.Id);
                serviceResponse.Message = "Email trigger does not exist";
                return serviceResponse; // Early return
            }

            // Check for duplicate name among other triggers
            var duplicateTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.TriggerType == TriggerTypesEnum.EmailTrigger &&
                    w.Name.ToLower() == emailTriggerDto.Name.ToLower() &&
                    w.Id != emailTriggerDto.Id
                )
                .FirstOrDefaultAsync();

            if (duplicateTrigger != null)
            {
                _logger.LogInformation("Update failed. Email trigger with name {EmailTriggerName} already exists.", emailTriggerDto.Name);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Email trigger with the same name already exists.";
                return serviceResponse;
            }

            // Trim leading/trailing spaces from all string properties in the DTO
            emailTriggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(emailTriggerDto);

            // Cast DTO to EmailTriggerModel to access subscription-specific fields
            var model = (EmailTriggerModel)emailTriggerDto;

            // Create or update the email subscription and update the DTO with the subscription ID
            var subscription = await ManageEmailTriggerSubscriptionAsync(model, "update", emailTriggerDto.Id);

            // update failed
            if (subscription.StatusCode != 200)
            {
                serviceResponse.Message = subscription.Message;
                return serviceResponse;
            }

            // Serialize EmailTriggerModel properties into the Metadata JSON column
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };

            // Ensure enums are stored as strings (not numeric values)
            jsonOptions.Converters.Add(new JsonStringEnumConverter());

            // Assign the serialized Metadata to the entity
            emailTrigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(subscription.Data, jsonOptions));

            // Set audit fields to track who last modified the trigger
            emailTrigger.LastModifiedByUserId = _userId;

            // Persist changes to repository
            _unitOfWork.TriggerRepo.Update(emailTrigger);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while updating email trigger with ID {EmailTriggerId}.", emailTriggerDto.Id);
                return serviceResponse;
            }

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
                .GetByConditionAsync(w => w.Id == emailTriggerId)
                .SingleOrDefaultAsync();

            // Check existence
            if (emailTrigger == null)
            {
                _logger.LogInformation("Delete failed. Email trigger with ID {EmailTriggerId} does not exist.", emailTriggerId);
                serviceResponse.Message = "Email trigger does not exist";
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
                .GetByConditionAsync(t => emailTriggerIds.Contains(t.Id))
                .ToListAsync();

            // Check if any triggers were found
            if (emailTriggers == null || emailTriggers.Count == 0)
            {
                _logger.LogInformation("Delete multiple failed. No email triggers found for provided IDs.");
                serviceResponse.Message = "Email triggers not found";
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
                .GetByConditionAsync(w => w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                .FirstOrDefaultAsync();

            if (triggerExists != null)
            {
                // Duplicate exists
                _logger.LogInformation("Email trigger name '{EmailTriggerName}' already exists.", checkAvailabilityDto.UserInput);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Email trigger name already exists";
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                return serviceResponse;
            }

            // Name is available
            serviceResponse.StatusCode = 200;
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.Message = "Email trigger name is available";
            _logger.LogInformation("Email trigger name '{EmailTriggerName}' is available.", checkAvailabilityDto.UserInput);
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
                a.TriggerId = emailTriggerId;
            });

            serviceResponse.Data = assignedAgents;
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
    public async Task<ServiceResponse<bool>> CreateJobByEmailTriggerIdAsync(string triggerId)
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

            // Retrieve trigger along with its flow versions
            var trigger = await _workspaceInternalDbContext.Triggers
                .Where(x => x.Id == triggerGuid)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
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
                    MachineId = null,
                    Priority = JobPriorityTypesEnum.Normal,
                    Status = JobStatusTypesEnum.Created,
                    CreatedOn = DateTimeOffset.UtcNow,
                    IsPublished = triggerFlowVersion.FlowVersion.IsPublished,
                };

                // Insert the new job into the repository
                await _unitOfWork.JobRepo.InsertAsync(newJob);

                // Check if changes were successfully saved
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Failed to save changes while inserting new job.");
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
            case TriggerProviderTypesEnum.M365:
                // Microsoft 365 / Outlook subscription
                {
                    // Get access token for M365 API
                    var accessToken = await GetM365AccessTokenAsync(emailTriggerModel.CredentialId);

                    // Add Bearer token to HttpClient
                    httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

                    var baseUrl = _environmentConfig.AppBaseUrl?.Trim().TrimEnd('/');

                    if (!baseUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                        baseUrl = "https://" + baseUrl;
                    var notificationUrl = $"{baseUrl}/worc/api/email-trigger/notify/{triggerId}";


                    // Build resource path for mailbox and folder
                    var resourcePath = !string.IsNullOrEmpty(emailTriggerModel.Folder)
                        ? $"/users/{emailTriggerModel.Mailbox}/mailFolders/{emailTriggerModel.Folder}/messages"
                        : $"/users/{emailTriggerModel.Mailbox}/messages";

                    // Build subscription request body
                    var subscriptionRequest = new
                    {
                        changeType = "created",
                        notificationUrl = notificationUrl,
                        resource = resourcePath,
                        expirationDateTime = emailTriggerModel.ExpiryDateTime.UtcDateTime.ToString("o"),
                        clientState = emailTriggerModel.ApiKey
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
                                    emailTriggerModel.SubscriptionId = subscriptionIdProperty.GetString();
                                }
                            }
                            break;

                        case "update":
                            var patchRequest = new HttpRequestMessage(new HttpMethod("PATCH"),
                                $"https://graph.microsoft.com/v1.0/subscriptions/{emailTriggerModel.SubscriptionId}")
                            {
                                Content = content
                            };
                            response = await httpClient.SendAsync(patchRequest);
                            break;

                        case "delete":
                            response = await httpClient.DeleteAsync($"https://graph.microsoft.com/v1.0/subscriptions/{emailTriggerModel.SubscriptionId}");
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
                            serviceResponse.Message = responseContent;
                        }
                        return serviceResponse;
                    }

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
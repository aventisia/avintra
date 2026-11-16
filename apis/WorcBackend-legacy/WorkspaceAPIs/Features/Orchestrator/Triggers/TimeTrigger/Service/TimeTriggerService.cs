using Org.BouncyCastle.Asn1.Cms;
using WorkspaceAPIs.Data.Migrations;

namespace WorkspaceAPIs.Services;

public class TimeTriggerService(
    ILogger<TimeTriggerService> logger,
    IUnitOfWork unitOfWork,
    IResourceUserAccessService resourceUserAccessService,
    IUserManagementGuardService userManagementGuardService,
    IHttpContextAccessor httpContextAccessor,
    ICurrentTenantService currentTenantService) : ITimeTriggerService
{
    private readonly ILogger<TimeTriggerService> _logger = logger;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IResourceUserAccessService _resourceUserAccessService = resourceUserAccessService;
    private readonly IUserManagementGuardService _userManagementGuardService = userManagementGuardService;
    private readonly ICurrentTenantService _currentTenantService = currentTenantService;
    private readonly Guid _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

    // Retrieve all time triggers associated with current user
    public async Task<ServiceResponse<IEnumerable<TimeTriggerDto>>> GetTimeTriggerListAsync(bool isPersonal)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<TimeTriggerDto>>
        {
            Data = null,
            Message = "Failed to retrieve time triggers, Please try again."
        };

        try
        {
            // Retrieve time triggers based on ownership / shared access
            List<Trigger> timeTriggers = new();
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccess = new();

            // Personal mode → only current user's triggers
            if (isPersonal)
            {
                timeTriggers = await _unitOfWork.TriggerRepo
                    .GetByConditionAsync(w =>
                        w.TriggerType == TriggerTypesEnum.Time &&
                        w.CreatedByUserId == _userId &&
                        w.EnvType == _currentTenantService.CurrentEnvType
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
            else
            {
                // Retrieve accessible trigger IDs for the current user
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

                // Retrieve tenant-wide or explicitly shared triggers.
                // Exclude triggers created by the current user; those belong in the personal tab.
                timeTriggers = await _unitOfWork.TriggerRepo
                    .GetByConditionAsync(w =>
                        w.TriggerType == TriggerTypesEnum.Time &&
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
            var timeTriggerDtoList = timeTriggers.Adapt<List<TimeTriggerDto>>();

            // Assign access levels:
            // - Personal triggers are always owned by the current user.
            // - Shared/tenant-wide triggers use granted permissions, defaulting to View.
            timeTriggerDtoList.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);
            });

            // Task successful
            serviceResponse.Data = timeTriggerDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Time triggers retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve an time trigger by its ID
    public async Task<ServiceResponse<TimeTriggerDto>> GetTimeTriggerAsync(Guid timeTriggerId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TimeTriggerDto>
        {
            Data = null,
            Message = "Failed to retrieve trigger, Please try again"
        };

        try
        {
            // Try to get time trigger
            var timeTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == timeTriggerId && w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (timeTrigger == null)
            {
                serviceResponse.Message = "Time trigger does not exist";
                return serviceResponse;
            }

            // Verify current user has permission to view this trigger
            var (canView, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                timeTrigger.Id,
                ResourceTypeEnum.Trigger,
                timeTrigger.CreatedByUserId,
                timeTrigger.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                _logger.LogInformation("User {UserId} attempted unauthorized access to time trigger {TriggerId}.", _userId, timeTrigger.Id);
                serviceResponse.Message = "You do not have access to view this time trigger.";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = timeTrigger.Adapt<TimeTriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Time trigger retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a time trigger by its name within the current environment and tenant.
    public async Task<ServiceResponse<TimeTriggerDto>> GetTimeTriggerByNameAsync(string triggerName)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TimeTriggerDto>
        {
            Data = null,
            Message = "Failed to retrieve trigger, Please try again"
        };

        try
        {
            // Validate the provided trigger name
            if (string.IsNullOrWhiteSpace(triggerName))
            {
                serviceResponse.Message = "Trigger name is required.";
                return serviceResponse;
            }

            // Normalize input for case-insensitive comparison
            var normalizedName = triggerName.Trim().ToLowerInvariant();

            // Try to get time trigger by name within the current environment
            var timeTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == normalizedName &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .FirstOrDefaultAsync();

            if (timeTrigger == null)
            {
                serviceResponse.Message = "Time trigger does not exist";
                return serviceResponse;
            }

            // Verify current user has permission to view this trigger
            var (canView, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                timeTrigger.Id,
                ResourceTypeEnum.Trigger,
                timeTrigger.CreatedByUserId,
                timeTrigger.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                _logger.LogInformation("User {UserId} attempted unauthorized access to time trigger {TriggerName}.", _userId, triggerName);
                serviceResponse.Message = "You do not have access to view this time trigger.";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = timeTrigger.Adapt<TimeTriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Time trigger retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Checks the availability of a time trigger name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsTimeTriggerNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check trigger name availability. Please try again"
        };

        try
        {
            // Validate trigger name uniqueness within the current environment
            var triggerAlreadyExists = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId && 
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // Trigger already exists
            if (triggerAlreadyExists != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A trigger with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Trigger name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Insert new time trigger 
    public async Task<ServiceResponse<TimeTriggerDto>> CreateNewTimeTriggerAsync(TimeTriggerDto timeTriggerDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<TimeTriggerDto>
        {
            Data = null,
            Message = "Failed to insert time trigger. Please try again"
        };

        try
        {
            // Block creating new time triggers while in the PROD environment.
            var prodBlock = CreateResourceGuard.Validate<TimeTriggerDto>(
                _currentTenantService.CurrentEnvType,
                "time trigger");
            if (prodBlock != null)
            {
                return prodBlock;
            }

            // Check if the effective date has already passed
            if (DateTimeOffset.UtcNow > timeTriggerDto.EffectiveDate)
            {
                serviceResponse.Message = "The effective date has already passed. Please provide a future date.";
                return serviceResponse;
            }

            if (timeTriggerDto.EndDate.HasValue && timeTriggerDto.EndDate.Value < timeTriggerDto.EffectiveDate)
            {
                _logger.LogWarning(
                    "Invalid trigger date range. EndDate {EndDate} is less than EffectiveDate {EffectiveDate}",
                    timeTriggerDto.EndDate,
                    timeTriggerDto.EffectiveDate);

                serviceResponse.Message = "End date must be greater than effective date.";
                return serviceResponse;
            }

            // Validate duplicate trigger by name (case-insensitive)
            var existingTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == timeTriggerDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            if (existingTrigger != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Time trigger with the same name already exists.";
                return serviceResponse; // Return early if duplicate found
            }

            // Trim all string properties on the DTO
            timeTriggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(timeTriggerDto);

            // Convert DTO to Trigger entity
            var newTimeTrigger = timeTriggerDto.Adapt<Trigger>();
            newTimeTrigger.Id = Guid.NewGuid();

            // Serialize TimeTriggerModel properties into Metadata JSON
            var model = (TimeTriggerModel)timeTriggerDto;

            model.LastTriggeredTime = DateTimeOffset.UtcNow;
            TimeTriggerMetadataHelpers.RebuildSchedule(model, newTimeTrigger.Timezone);

            newTimeTrigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(model, TimeTriggerMetadataHelpers.JsonOptions));

            // Set the TriggerType explicitly
            newTimeTrigger.TriggerType = TriggerTypesEnum.Time;

            // Set the environment explicitly from the current request
            newTimeTrigger.EnvType = _currentTenantService.CurrentEnvType;

            // Set audit fields: created and last modified by current user
            newTimeTrigger.CreatedByUserId = _userId;
            newTimeTrigger.LastModifiedByUserId = _userId;

            // Insert entity into repository
            await _unitOfWork.TriggerRepo.InsertAsync(newTimeTrigger);

            // Save changes to database and validate success
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while creating timr trigger with name {timrTriggerName}.", newTimeTrigger.Name);
                return serviceResponse;
            }

            // Assign ownership of the newly created trigger to current user
            if (!await _resourceUserAccessService.AssignOwnerAsync(_userId, newTimeTrigger.Id, ResourceTypeEnum.Trigger))
            {
                _logger.LogError("Failed assigning owner permissions for email trigger {TriggerId}.", newTimeTrigger.Id);
                serviceResponse.Message = "Failed assigning ownership.";
                return serviceResponse;
            }

            // Retrieve all agents from the database that are linked to the provided email trigger DTO.
            // Only include agents whose IDs are in emailTriggerDto.Agents and are marked as published.
            var agentIds = timeTriggerDto.Agents?
                .Select(a => a.Id)
                .ToList();

            var agents = agentIds != null && agentIds.Any()
                ? await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => agentIds.Contains(w.Id) && w.IsPublished)
                    .ToListAsync()
                : new List<FlowVersion>();

            // If we found any agents that match the criteria, proceed with creating trigger flow versions.
            if (agents.Count > 0)
            {
                // Create a collection of TriggerFlowVersion objects based on the retrieved agents.
                var triggerFlowVersions = agents.Select(agent => new TriggerFlowVersion()
                {
                    TriggerId = newTimeTrigger.Id,
                    FlowVersionId = agent.Id,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                }).ToList();

                // Insert the newly created time trigger into the repository.
                await _unitOfWork.TriggerFlowVersionRepo.InsertAsync(triggerFlowVersions);

                // Attempt to save changes to the database.
                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }
            }

            newTimeTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == newTimeTrigger.Id)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Task successful
            serviceResponse.Data = newTimeTrigger.Adapt<TimeTriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Time trigger created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Update an existence time trigger
    public async Task<ServiceResponse<TimeTriggerDto>> UpdateTimeTriggerAsync(TimeTriggerDto timeTriggerDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<TimeTriggerDto>
        {
            Data = null,
            Message = "Failed to update time trigger. Please try again"
        };

        try
        {
            if (timeTriggerDto.EndDate.HasValue && timeTriggerDto.EndDate.Value < timeTriggerDto.EffectiveDate)
            {
                _logger.LogWarning(
                    "Invalid trigger date range. EndDate {EndDate} is less than EffectiveDate {EffectiveDate}",
                    timeTriggerDto.EndDate,
                    timeTriggerDto.EffectiveDate);

                serviceResponse.Message = "End date must be greater than effective date.";
                return serviceResponse;
            }

            // Retrieve existing time trigger
            var timeTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == timeTriggerDto.Id && w.EnvType == _currentTenantService.CurrentEnvType)
                .Include(i => i.TriggerFlowVersions)
                .SingleOrDefaultAsync();

            // Validate existence
            if (timeTrigger == null)
            {
                serviceResponse.Message = "Time trigger does not exist";
                return serviceResponse; // Early return
            }

            // Require OM for PROD edits based on the persisted trigger environment.
            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<TimeTriggerDto>(
                timeTrigger.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "time trigger");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            var (canEdit, accessLevel) = await _resourceUserAccessService.GetResourceAccessAsync(
                _userId,
                timeTrigger.Id,
                ResourceTypeEnum.Trigger,
                timeTrigger.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                serviceResponse.Message = "You do not have access to update this time trigger.";
                return serviceResponse;
            }

            // Check for duplicate name among other triggers
            var duplicateTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == timeTriggerDto.Name.ToLower() &&
                    w.Id != timeTriggerDto.Id &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .FirstOrDefaultAsync();

            if (duplicateTrigger != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Time trigger with the same name already exists.";
                return serviceResponse;
            }

            // Normalize input (trim all string properties)
            timeTriggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(timeTriggerDto);

            var model = System.Text.Json.JsonSerializer.Deserialize<TimeTriggerModel>(
                timeTrigger.Metadata.RootElement.GetRawText(),
                TimeTriggerMetadataHelpers.JsonOptions);

            // Check if the effective date has already passed
            if (model.EffectiveDate != timeTriggerDto.EffectiveDate && DateTimeOffset.UtcNow > timeTriggerDto.EffectiveDate)
            {
                serviceResponse.Message = "The effective date has already passed. Please provide a future date.";
                return serviceResponse;
            }

            var endDateChanged = model.EndDate != timeTriggerDto.EndDate;
            var storedNextTriggerTime = model.NextTriggerTime;

            timeTrigger.Timezone = timeTriggerDto.Timezone;
            model.Frequency = timeTriggerDto.Frequency;
            model.Interval = timeTriggerDto.Interval;
            model.AtTime = timeTriggerDto.AtTime;
            model.EndDate = timeTriggerDto.EndDate;
            model.Weekdays = timeTriggerDto.Weekdays;
            model.MonthDays = timeTriggerDto.MonthDays;
            model.ExceptionHours = timeTriggerDto.ExceptionHours;
            model.ExceptionWeekdays = timeTriggerDto.ExceptionWeekdays;
            model.ExceptionDates = timeTriggerDto.ExceptionDates;
            model.EffectiveDate = timeTriggerDto.EffectiveDate;

            // IMPORTANT NOTE: rebuilds on every update so a row stored before the trigger timezone was honoured is repaired by a re-save.
            TimeTriggerMetadataHelpers.RebuildSchedule(model, timeTrigger.Timezone);

            // IMPORTANT NOTE: keeps a run that fell due within the last minute so a re-save landing before the scheduler tick does not skip it.
            var now = DateTimeOffset.UtcNow;
            if (storedNextTriggerTime <= now && storedNextTriggerTime > now.AddMinutes(-1))
                model.NextTriggerTime = storedNextTriggerTime;

            var isUnchangedExpiredEndDate = !endDateChanged && timeTriggerDto.EndDate < now;
            if (timeTriggerDto.EndDate.HasValue && !isUnchangedExpiredEndDate && timeTriggerDto.EndDate.Value < model.NextTriggerTime)
            {
                _logger.LogWarning(
                    "Invalid trigger date range. EndDate {EndDate} is earlier than the next trigger time {NextTriggerTime}.",
                    timeTriggerDto.EndDate,
                    model.NextTriggerTime);

                serviceResponse.Message = "End date cannot be less than the next trigger time.";
                return serviceResponse;
            }

            // Update IsDisabled if trigger activation start time has changed
            if (timeTriggerDto.IsDisabled != null && timeTriggerDto.IsDisabled != timeTrigger.IsDisabled)
                timeTrigger.IsDisabled = timeTriggerDto.IsDisabled.Value;

            // Update metadata with latest subscription data
            timeTrigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(model, TimeTriggerMetadataHelpers.JsonOptions));

            // Set audit fields to track who last modified the trigger
            timeTrigger.LastModifiedByUserId = _userId;

            // Persist changes to repository
            _unitOfWork.TriggerRepo.Update(timeTrigger);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database SaveChanges failed while updating message trigger with ID {messageTriggerId}.", timeTrigger.Id);
                return serviceResponse;
            }

            // Handle updating the associated agents for the time trigger
            var currentAgentIds = timeTriggerDto.Agents?
                .Select(a => a.Id)
                .ToList() ?? null;
            if (currentAgentIds != null && currentAgentIds.Any())
            {
                // Get the list of agent IDs currently linked to the time trigger
                var existingAgentIds = timeTrigger.TriggerFlowVersions
                    .Select(s => s.FlowVersionId)
                    .ToList();

                // Identify agents that need to be removed (those no longer in the current request)
                var agentsToRemove = existingAgentIds
                    .Where(id => !currentAgentIds.Contains(id))
                    .ToList();

                if (agentsToRemove.Any())
                {
                    // Remove the corresponding time trigger flow versions from the database
                    var agentsToRemoveFlowVersions = timeTrigger.TriggerFlowVersions
                        .Where(w => agentsToRemove.Contains(w.FlowVersionId))
                        .ToList();

                    _unitOfWork.TriggerFlowVersionRepo.Delete(agentsToRemoveFlowVersions);

                    // Attempt to save changes to the database
                    if (!await _unitOfWork.SaveAsync())
                    {
                        return serviceResponse;
                    }
                }

                // Identify new agents that need to be added (those not currently associated with the trigger)
                var newAgentIds = currentAgentIds.Except(existingAgentIds).ToList();

                if (newAgentIds.Any())
                {
                    // Get the flow versions for the new agent IDs
                    var agents = await _unitOfWork.FlowVersionRepo
                        .GetByConditionAsync(w =>
                            newAgentIds.Contains(w.Id) &&
                            w.IsPublished
                        )
                        .ToListAsync();

                    if (agents.Count > 0)
                    {
                        // Create new flow versions for these agents
                        var newTriggerFlowVersions = agents.Select(s => new TriggerFlowVersion()
                        {
                            TriggerId = timeTrigger.Id,
                            FlowVersionId = s.Id,
                            CreatedByUserId = _userId,
                            LastModifiedByUserId = _userId
                        }).ToList();

                        // Insert the new time trigger flow versions
                        await _unitOfWork.TriggerFlowVersionRepo.InsertAsync(newTriggerFlowVersions);

                        // Attempt to save changes to the database
                        if (!await _unitOfWork.SaveAsync())
                        {
                            return serviceResponse;
                        }
                    }
                }
            }

            timeTrigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == timeTrigger.Id)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.TriggerFlowVersions)
                    .ThenInclude(i2 => i2.FlowVersion)
                        .ThenInclude(i3 => i3.Flow)
                .AsNoTracking()
                .SingleOrDefaultAsync();


            // Task successful
            serviceResponse.Data = timeTrigger.Adapt<TimeTriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Time Trigger updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Remove an time trigger by its ID
    public async Task<ServiceResponse<bool>> DeleteTimeTriggerAsync(Guid timeTriggerId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete time trigger. Please try again"
        };

        try
        {
            // Try to get time trigger
            var trigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Id == timeTriggerId && w.TriggerType == TriggerTypesEnum.Time && w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();

            // Trigger does not exist
            if (trigger == null)
            {
                serviceResponse.Message = "Time Trigger does not exist";
                return serviceResponse;
            }

            // PROD-guard: block deletion of PROD triggers or triggers with a same-name PROD twin.
            var guardBlock = await DeleteResourceGuard.ValidateAsync(
                _unitOfWork.TriggerRepo,
                trigger.EnvType,
                trigger.Name,
                w => w.Name.ToLower() == trigger.Name.ToLower() &&
                     w.EnvType == ConfigureEnvironmentType.Prod &&
                     w.TenantId == trigger.TenantId &&
                     w.SpaceId == trigger.SpaceId,
                "time trigger");
            if (guardBlock != null)
            {
                return guardBlock;
            }

            // Validate current user has permission to delete this trigger
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
                _logger.LogInformation("User {UserId} attempted unauthorized deletion of time trigger {TriggerId}.", _userId, trigger.Id);
                serviceResponse.Message = "You do not have access to delete this time trigger.";
                return serviceResponse;
            }

            // Remove resource share mappings before deleting trigger
            await _resourceUserAccessService.DeleteResourceUserAccessesAsync(trigger.Id, ResourceTypeEnum.Trigger);

            // Delete time trigger
            _unitOfWork.TriggerRepo.Delete(trigger);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Time Trigger deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes multiple timetriggers by their IDs.
    public async Task<ServiceResponse<bool>> DeleteTimeTriggersAsync(IEnumerable<Guid> timeTriggerIds)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete time time triggers. Please try again"
        };

        try
        {
            // Validate time triggers existence
            var timeTriggers = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => timeTriggerIds.Contains(w.Id) && w.TriggerType == TriggerTypesEnum.Time && w.EnvType == _currentTenantService.CurrentEnvType)
                .ToListAsync();

            // Triggers do not exist
            if (timeTriggers.Count == 0)
            {
                serviceResponse.Message = "Triggers do not exist";
                return serviceResponse;
            }

            // Validate delete access + PROD-guard for all triggers
            var blockedNames = new List<string>();
            foreach (var trigger in timeTriggers)
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
                    serviceResponse.Message = "You do not have access to delete one or more time triggers.";
                    return serviceResponse;
                }

                // PROD-guard: block the whole batch if any trigger is PROD or has a same-name PROD twin.
                var guardBlock = await DeleteResourceGuard.ValidateAsync(
                    _unitOfWork.TriggerRepo,
                    trigger.EnvType,
                    trigger.Name,
                    w => w.Name.ToLower() == trigger.Name.ToLower() &&
                         w.EnvType == ConfigureEnvironmentType.Prod &&
                         w.TenantId == trigger.TenantId &&
                         w.SpaceId == trigger.SpaceId,
                    "time trigger");
                if (guardBlock != null)
                {
                    blockedNames.Add(trigger.Name);
                }
            }

            // Reject the entire batch when any selected trigger is protected by the PROD guard.
            if (blockedNames.Count > 0)
            {
                serviceResponse.Message =
                    $"Cannot delete the following time trigger(s) because they are published (PROD) or have a same-name PROD version: {string.Join(", ", blockedNames)}";
                return serviceResponse;
            }

            // Remove all resource share mappings before deleting triggers
            await _resourceUserAccessService.DeleteResourceUserAccessesAsync(timeTriggerIds, ResourceTypeEnum.Trigger);

            // TODO: Check trigger relationship with other entities

            // Delete triggers
            _unitOfWork.TriggerRepo.Delete(timeTriggers);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{timeTriggers.Count} triggers deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve agent list
    public async Task<ServiceResponse<IEnumerable<AssignAgentTriggerDto>>> GetAgentsByTriggerAsync(Guid timeTriggerId)
    {
        // Initialize the response with a failed result
        var serviceResponse = new ServiceResponse<IEnumerable<AssignAgentTriggerDto>>
        {
            Data = null,
            Message = "Failed to retrieve agents. Please try again."
        };

        try
        {
            // Check if the trigger exists and belongs to the current user
            var triggerFlowVersions = await _unitOfWork.TriggerFlowVersionRepo
                .GetByConditionAsync(w => w.TriggerId == timeTriggerId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .Include(i => i.FlowVersion)
                    .ThenInclude(i2 => i2.Flow)
                .ToListAsync();

            // Return the agents along with their assignment status
            serviceResponse.Data = triggerFlowVersions.Adapt<List<AssignAgentTriggerDto>>(); ;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Agents retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while retrieving agents for trigger {TriggerId}.", timeTriggerId);
            return serviceResponse;
        }

        return serviceResponse;
    }

    // // Retrieve trigger select-option
    // public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetTriggerToSelectOptionAsync()
    // {
    //     // Initialize serviceResponse with failed response
    //     var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
    //     {
    //         Data = null,
    //         Message = "Failed to retrieve triggers, please try again."
    //     };

    //     try
    //     {
    //         // Retrieve the triggers and map them to SelectOption
    //         var triggersToSelect = await _unitOfWork.TriggerRepo.GetAllAsync()
    //             .ProjectToType<SelectOption>()
    //             .AsNoTracking()
    //             .ToListAsync();

    //         // Set the serviceResponse
    //         serviceResponse.Data = triggersToSelect;
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = "Triggers retrieved successfully";
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "An error occurred while retrieving the trigger list.");
    //     }

    //     return serviceResponse;
    // }
}

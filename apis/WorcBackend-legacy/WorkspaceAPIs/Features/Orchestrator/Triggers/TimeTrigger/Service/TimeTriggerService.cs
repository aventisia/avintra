using Org.BouncyCastle.Asn1.Cms;
using WorkspaceAPIs.Data.Migrations;

namespace WorkspaceAPIs.Services;

public class TimeTriggerService(
    ILogger<TimeTriggerService> logger,
    IUnitOfWork unitOfWork,
    IResourceShareService resourceShareService,
    IHttpContextAccessor httpContextAccessor) : ITimeTriggerService
{
    private readonly ILogger<TimeTriggerService> _logger = logger;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly IResourceShareService _resourceShareService = resourceShareService;
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
                        w.CreatedByUserId == _userId
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
                resourceAccess = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _userId,
                    ResourceTypeEnum.Trigger,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    }
                );

                // Retrieve tenant-wide or explicitly shared triggers
                timeTriggers = await _unitOfWork.TriggerRepo
                    .GetByConditionAsync(w =>
                        w.TriggerType == TriggerTypesEnum.Time &&
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
                .GetByConditionAsync(w => w.Id == timeTriggerId)
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
                _logger.LogInformation("There is no time trigger with Id {Id}", timeTriggerId);
                return serviceResponse;
            }

            // Verify current user has permission to view this trigger
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
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
            // Validate trigger name uniqueness
            var triggerAlreadyExists = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.TriggerType == TriggerTypesEnum.Time && w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
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
                .GetByConditionAsync(w => w.TriggerType == TriggerTypesEnum.Time && w.Name.ToLower() == timeTriggerDto.Name.ToLower())
                .FirstOrDefaultAsync();

            if (existingTrigger != null)
            {
                _logger.LogInformation("Time trigger creation failed. Name {timeTriggerName} already exists.", timeTriggerDto.Name);
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
            model.CronExpression = CronScheduleUtil.BuildCronExpression(
                model.Frequency,
                model.Interval,
                newTimeTrigger.Timezone,
                model.AtTime,
                model.Weekdays,
                model.MonthDays,
                false
            );
            model.NextTriggerTime = CronScheduleUtil.ComputeNextTriggerUtc(
                model.CronExpression,
                model.EffectiveDate,
                model.ExceptionHours,
                model.ExceptionWeekdays,
                model.ExceptionDates
            );

            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
                WriteIndented = false
            };

            // Ensure enums serialize as strings
            jsonOptions.Converters.Add(new JsonStringEnumConverter());

            newTimeTrigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(model, jsonOptions));

            // Set the TriggerType explicitly
            newTimeTrigger.TriggerType = TriggerTypesEnum.Time;

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
            if (!await _resourceShareService.AssignOwnerAsync(_userId, newTimeTrigger.Id, ResourceTypeEnum.Trigger))
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
                    _logger.LogInformation("Failed to save changes while inserting the new trigger.");
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
            _logger.LogInformation("Time trigger created successfully with id {Id} and agents assigned", newTimeTrigger.Id);
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
                .GetByConditionAsync(w => w.Id == timeTriggerDto.Id)
                .Include(i => i.TriggerFlowVersions)
                .SingleOrDefaultAsync();

            // Validate existence
            if (timeTrigger == null)
            {
                _logger.LogInformation("Update failed. time trigger with ID {timeTriggerId} does not exist.", timeTriggerDto.Id);
                serviceResponse.Message = "Time trigger does not exist";
                return serviceResponse; // Early return
            }

            var (canEdit, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
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
                    w.TriggerType == TriggerTypesEnum.Time &&
                    w.Name.ToLower() == timeTriggerDto.Name.ToLower() &&
                    w.Id != timeTriggerDto.Id
                )
                .FirstOrDefaultAsync();

            if (duplicateTrigger != null)
            {
                _logger.LogInformation("Update failed. time trigger with name {timeTriggerName} already exists.", timeTriggerDto.Name);
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "Time trigger with the same name already exists.";
                return serviceResponse;
            }

            // Normalize input (trim all string properties)
            timeTriggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(timeTriggerDto);

            // JSON serializer configuration
            var jsonOptions = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
            };

            jsonOptions.Converters.Add(new JsonStringEnumConverter());

            // Deserialize existing metadata into model
            var model = System.Text.Json.JsonSerializer.Deserialize<TimeTriggerModel>(
                timeTrigger.Metadata.RootElement.GetRawText(),
                jsonOptions);

            // Check if the effective date has already passed
            if (model.EffectiveDate != timeTriggerDto.EffectiveDate && DateTimeOffset.UtcNow > timeTriggerDto.EffectiveDate)
            {
                serviceResponse.Message = "The effective date has already passed. Please provide a future date.";
                return serviceResponse;
            }

            // Determines if scheduling-related changes require the cron expression to be rebuilt.
            bool shouldRebuildCronExpression = false;

            // Update Timezone if it has changed
            if (timeTrigger.Timezone != timeTriggerDto.Timezone)
            {
                timeTrigger.Timezone = timeTriggerDto.Timezone;
                shouldRebuildCronExpression = true;
            }

            // Update Frequency if scheduling type has changed (e.g., Daily → Weekly)
            if (model.Frequency != timeTriggerDto.Frequency)
            {
                model.Frequency = timeTriggerDto.Frequency;
                shouldRebuildCronExpression = true;
            }

            // Update Interval if execution frequency spacing has changed
            if (model.Interval != timeTriggerDto.Interval)
            {
                model.Interval = timeTriggerDto.Interval;
                shouldRebuildCronExpression = true;
            }

            // Update AtTime if scheduled execution time of day has changed
            if (model.AtTime != timeTriggerDto.AtTime)
            {
                model.AtTime = timeTriggerDto.AtTime;
                shouldRebuildCronExpression = true;
            }

            // Update EndDate if scheduled execution time of day has changed
            if (model.EndDate != timeTriggerDto.EndDate)
                model.EndDate = timeTriggerDto.EndDate;

            // Update Weekdays if the selected execution days of week have changed
            if (!Enumerable.SequenceEqual(model.Weekdays ?? new(), timeTriggerDto.Weekdays ?? new()))
            {
                model.Weekdays = timeTriggerDto.Weekdays;
                shouldRebuildCronExpression = true;
            }

            // Update MonthDays if specific calendar days for execution have changed
            if (!Enumerable.SequenceEqual(model.MonthDays ?? new(), timeTriggerDto.MonthDays ?? new()))
            {
                model.MonthDays = timeTriggerDto.MonthDays;
                shouldRebuildCronExpression = true;
            }

            // Update ExceptionHours if restricted execution hours have changed
            if (!Enumerable.SequenceEqual(model.ExceptionHours ?? new(), timeTriggerDto.ExceptionHours ?? new()))
            {
                model.ExceptionHours = timeTriggerDto.ExceptionHours;
                shouldRebuildCronExpression = true;
            }

            // Update ExceptionWeekdays if excluded weekdays have changed
            if (!Enumerable.SequenceEqual(model.ExceptionWeekdays ?? new(), timeTriggerDto.ExceptionWeekdays ?? new()))
            {
                model.ExceptionWeekdays = timeTriggerDto.ExceptionWeekdays;
                shouldRebuildCronExpression = true;
            }

            // Update ExceptionDates if specific excluded calendar dates have changed
            if (!Enumerable.SequenceEqual(model.ExceptionDates ?? new(), timeTriggerDto.ExceptionDates ?? new()))
            {
                model.ExceptionDates = timeTriggerDto.ExceptionDates;
                shouldRebuildCronExpression = true;
            }

            // Update EffectiveDate if trigger activation start time has changed
            if (model.EffectiveDate != timeTriggerDto.EffectiveDate)
            {
                model.EffectiveDate = timeTriggerDto.EffectiveDate;
                shouldRebuildCronExpression = true;
            }

            if (shouldRebuildCronExpression)
            {
                // Rebuild cron expression because scheduling parameters have changed (frequency, interval, timezone, time-of-day, weekdays, or month days).
                model.CronExpression = CronScheduleUtil.BuildCronExpression(
                    model.Frequency,
                    model.Interval,
                    timeTriggerDto.Timezone,
                    model.AtTime,
                    model.Weekdays,
                    model.MonthDays
                );

                // Recalculate the next execution time based on the updated cron expression and current scheduling constraints (effective date + exceptions).
                model.NextTriggerTime = CronScheduleUtil.ComputeNextTriggerUtc(
                    model.CronExpression,
                    model.EffectiveDate,
                    model.ExceptionHours,
                    model.ExceptionWeekdays,
                    model.ExceptionDates
                );
            }
            if (timeTriggerDto.EndDate.HasValue && timeTriggerDto.EndDate.Value < model.NextTriggerTime)
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
            timeTrigger.Metadata = JsonDocument.Parse(System.Text.Json.JsonSerializer.Serialize(model, jsonOptions));

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
                    _logger.LogInformation("Removing agents with IDs: {AgentIds}", string.Join(", ", agentsToRemove));

                    // Remove the corresponding time trigger flow versions from the database
                    var agentsToRemoveFlowVersions = timeTrigger.TriggerFlowVersions
                        .Where(w => agentsToRemove.Contains(w.FlowVersionId))
                        .ToList();

                    _unitOfWork.TriggerFlowVersionRepo.Delete(agentsToRemoveFlowVersions);

                    // Attempt to save changes to the database
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogInformation("Failed to delete time trigger flow versions.");
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
                        _logger.LogInformation("Adding new agents with IDs: {AgentIds}", string.Join(", ", newAgentIds));

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
                            _logger.LogInformation("Failed to add new trigger flow versions.");
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
                .GetByConditionAsync(w => w.Id == timeTriggerId && w.TriggerType == TriggerTypesEnum.Time)
                .FirstOrDefaultAsync();

            // Trigger does not exist
            if (trigger == null)
            {
                _logger.LogInformation($"Time Trigger does not exist");
                serviceResponse.Message = "Time Trigger does not exist";
                return serviceResponse;
            }

            // Validate current user has permission to delete this trigger
            var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
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
            await _resourceShareService.DeleteResourceSharesAsync(trigger.Id, ResourceTypeEnum.Trigger);

            // Delete time trigger
            _unitOfWork.TriggerRepo.Delete(trigger);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting time trigger");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Time Trigger deleted successfully";

            _logger.LogInformation("Time Trigger deleted successfully of Id {Id}", timeTriggerId);

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
                .GetByConditionAsync(w => timeTriggerIds.Contains(w.Id) && w.TriggerType == TriggerTypesEnum.Time)
                .ToListAsync();

            // Triggers do not exist
            if (timeTriggers.Count == 0)
            {
                _logger.LogInformation($"Triggers do not exist");
                serviceResponse.Message = "Triggers do not exist";
                return serviceResponse;
            }

            // Validate delete access for all triggers
            foreach (var trigger in timeTriggers)
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
                    }
                );

                if (!canDelete)
                {
                    _logger.LogInformation("User {UserId} attempted unauthorized bulk deletion.", _userId);
                    serviceResponse.Message = "You do not have access to delete one or more time triggers.";
                    return serviceResponse;
                }
            }

            // Remove all resource share mappings before deleting triggers
            await _resourceShareService.DeleteResourceSharesAsync(timeTriggerIds, ResourceTypeEnum.Trigger);

            // TODO: Check trigger relationship with other entities

            // Delete triggers
            _unitOfWork.TriggerRepo.Delete(timeTriggers);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting triggers");
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
    // public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetTriggerToSelectOptionAsync()
    // {
    //     // Initialize serviceResponse with failed response
    //     var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
    //     {
    //         Data = null,
    //         Message = "Failed to retrieve triggers, please try again."
    //     };

    //     try
    //     {
    //         // Retrieve the triggers and map them to SelectOptionDto
    //         var triggersToSelect = await _unitOfWork.TriggerRepo.GetAllAsync()
    //             .ProjectToType<SelectOptionDto>()
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

    //  private async Task<ServiceResponse<bool>> AssignOrUpdateAgentsAsync(Guid triggerId, IEnumerable<Guid> agentIds)
    // {
    //     var serviceResponse = new ServiceResponse<bool>
    //     {
    //         Data = false,
    //         Message = "Failed to assign agents. Please try again."
    //     };

    //     try
    //     {
    //         // Validate that agent IDs are unique (no duplicates)
    //         if (agentIds.Count() != agentIds.Distinct().Count())
    //         {
    //             _logger.LogInformation("Duplicate agent IDs detected.");
    //             serviceResponse.Message = "Agent IDs cannot contain duplicates.";
    //             return serviceResponse;
    //         }

    //         // Validate agents and fetch valid agent entries
    //         var agents = await _unitOfWork.FlowVersionRepo
    //             .GetByConditionAsync(w => agentIds.Contains(w.Id) && w.IsPublished)
    //             .AsNoTracking()
    //             .ToListAsync();

    //         var invalidAgentIds = agentIds.Except(agents.Select(a => a.Id)).ToList();
    //         if (invalidAgentIds.Count != 0)
    //         {
    //             _logger.LogInformation("Invalid agent IDs found: {InvalidAgentIds}", string.Join(", ", invalidAgentIds));
    //             serviceResponse.Message = $"The following agent IDs are invalid or do not belong to the user: {string.Join(", ", invalidAgentIds)}";
    //             return serviceResponse;
    //         }

    //         // Get existing trigger flows and determine changes
    //         var existingTriggerFlows = await _unitOfWork.TriggerFlowRepo
    //                     .GetByConditionAsync(mf => mf.TriggerId == triggerId)
    //                     .AsNoTracking()
    //                     .ToListAsync();

    //         var existingAgentIds = existingTriggerFlows.Select(mf => mf.FlowVersionId).ToList();

    //         var newAgentIds = agentIds.Except(existingAgentIds).ToList();
    //         var removedAgentIds = existingAgentIds.Except(agentIds).ToList();

    //         // Create new TriggerFlow entries for agents not already assigned
    //         var triggerFlowsToAdd = newAgentIds.Select(agentId => new TimeTriggersFlowVersion
    //         {
    //             TriggerId = triggerId,
    //             FlowVersionId = agentId,
    //             CreatedByUserId = _userId,
    //             LastModifiedByUserId = _userId
    //         }).ToList();

    //         // Remove existing TriggerFlow entries for agents that are no longer assigned
    //         var triggerFlowsToRemove = existingTriggerFlows
    //             .Where(mf => removedAgentIds.Contains(mf.FlowVersionId))
    //             .ToList();

    //         // Begin the transaction to insert and remove data
    //         if (triggerFlowsToAdd.Count != 0)
    //         {
    //             await _unitOfWork.TriggerFlowRepo.InsertAsync(triggerFlowsToAdd);

    //             // Attempt to save changes to the database
    //             if (!await _unitOfWork.SaveAsync())
    //             {
    //                 _logger.LogInformation("Database save operation failed while assigning or inserting agents.");
    //                 serviceResponse.Message = "Failed to insert agent assignments for the trigger.";
    //                 return serviceResponse;
    //             }
    //         }

    //         if (triggerFlowsToRemove.Any())
    //         {
    //             _unitOfWork.TriggerFlowRepo.Delete(triggerFlowsToRemove);

    //             // Attempt to save changes to the database
    //             if (!await _unitOfWork.SaveAsync())
    //             {
    //                 _logger.LogInformation("Database save operation failed while assigning or deleting agents.");
    //                 serviceResponse.Message = "Failed to insert agent assignments for the trigger.";
    //                 return serviceResponse;
    //             }
    //         }
    //         serviceResponse.StatusCode = 200;
    //         serviceResponse.Message = $"{newAgentIds.Count} agents assigned and {removedAgentIds.Count} agents removed from the trigger.";
    //     }
    //     catch (Exception ex)
    //     {
    //         _logger.LogError(ex, "An unexpected error occurred while assigning agents.");
    //         return serviceResponse;
    //     }

    //     return serviceResponse;
    // }



}
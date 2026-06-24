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
                                                     .GetByConditionAsync(w =>
                                                        w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
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
    public async Task<ServiceResponse<TimeTriggerDto>> CreateNewTimeTriggerAsync(TimeTriggerDto triggerDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<TimeTriggerDto>
        {
            Data = null,
            Message = "Failed to insert time trigger. Please try again"
        };

        try
        {
            // // Convert the effective date to UTC based on the given timezone
            // var triggerEffectiveUtc = CronScheduleUtil.ConvertLocalTimeToUtc(triggerDto.Timezone, triggerDto.EffectiveDate);

            // Check if the effective date has already passed
            if (DateTimeOffset.UtcNow > triggerDto.EffectiveDate)
            {
                serviceResponse.Message = "The effective date has already passed. Please provide a future date.";
                return serviceResponse;
            }

            // Validate trigger name uniqueness
            var triggerAlreadyExists = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Name.ToLower() == triggerDto.Name.ToLower())
                .FirstOrDefaultAsync();

            // Trigger already exists
            if (triggerAlreadyExists != null)
            {
                _logger.LogInformation("Time trigger already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A time trigger with the same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto's string properties
            triggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(triggerDto);

            // Default mapping
            var newTimeTrigger = triggerDto.Adapt<TimeTrigger>();
            newTimeTrigger.LastTriggeredTime = DateTimeOffset.UtcNow;
            newTimeTrigger.CreatedByUserId = _userId;
            newTimeTrigger.LastModifiedByUserId = _userId;
            newTimeTrigger.CronExpression = CronScheduleUtil.BuildCronExpression(
                newTimeTrigger.Frequency,
                newTimeTrigger.Interval,
                newTimeTrigger.Timezone,
                newTimeTrigger.AtTime,
                newTimeTrigger.Weekdays,
                newTimeTrigger.MonthDays,
                false
            );
            newTimeTrigger.NextTriggerTime = CronScheduleUtil.ComputeNextTriggerUtc(
                newTimeTrigger.CronExpression,
                newTimeTrigger.EffectiveDate,
                newTimeTrigger.ExceptionHours,
                newTimeTrigger.ExceptionWeekdays,
                newTimeTrigger.ExceptionDates
            );

            // Insert time trigger
            await _unitOfWork.TimeTriggerRepo.InsertAsync(newTimeTrigger);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new time trigger");
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
            var agentIds = triggerDto.Agents?
                .Select(a => a.Id)
                .ToList();

            var agents = agentIds != null && agentIds.Any()
                ? await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => agentIds.Contains(w.Id) && w.IsPublished)
                    .ToListAsync()
                : new List<FlowVersion>();

            // If we found any agents that match the criteria, proceed with creating time trigger flow versions.
            if (agents.Count > 0)
            {
                // Create a collection of TimeTriggersFlowVersion objects based on the retrieved agents.
                var timeTriggerFlowVersions = agents.Select(agent => new TimeTriggersFlowVersion()
                {
                    TriggerId = newTimeTrigger.Id,
                    FlowVersionId = agent.Id,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                }).ToList();

                // Insert the newly created time trigger into the repository.
                await _unitOfWork.TimeTriggerFlowRepo.InsertAsync(timeTriggerFlowVersions);

                // Attempt to save changes to the database.
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Failed to save changes while inserting the new time trigger.");
                    return serviceResponse;
                }
            }

            // Log a human-readable description of the cron schedule for reference
            _logger.LogInformation(CronScheduleUtil.BuildDescription(
                newTimeTrigger.Frequency,
                newTimeTrigger.Interval,
                newTimeTrigger.Timezone,
                newTimeTrigger.AtTime,
                newTimeTrigger.Weekdays,
                newTimeTrigger.MonthDays
            ));

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
    public async Task<ServiceResponse<TimeTriggerDto>> UpdateTimeTriggerAsync(TimeTriggerDto triggerDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<TimeTriggerDto>
        {
            Data = null,
            Message = "Failed to update time trigger. Please try again"
        };

        try
        {
            // Convert the effective date to UTC based on the given timezone
            var triggerEffectiveUtc = CronScheduleUtil.ConvertLocalTimeToUtc(triggerDto.Timezone, triggerDto.EffectiveDate);

            // Check if the effective date has already passed
            if (DateTimeOffset.UtcNow > triggerEffectiveUtc)
            {
                serviceResponse.Message = "The effective date has already passed. Please provide a future date.";
                return serviceResponse;
            }

            // Validate trigger existence
            var trigger = await _unitOfWork.TimeTriggerRepo
                .GetByConditionAsync(m =>
                    m.Id == triggerDto.Id
                )
                .Include(i => i.TimeTriggerFlowVersions)
                .FirstOrDefaultAsync();

            // Trigger does not exist
            if (trigger == null)
            {
                _logger.LogInformation("Time Trigger does not exist");
                serviceResponse.Message = "Time Trigger does not exist";
                return serviceResponse;
            }


            // Validate current user has permission to update this trigger
            var (canEdit, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                trigger.Id,
                ResourceTypeEnum.Trigger,
                trigger.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                _logger.LogInformation("User {UserId} attempted unauthorized update of time trigger {TriggerId}.", _userId, trigger.Id);
                serviceResponse.Message = "You do not have access to update this time trigger.";
                return serviceResponse;
            }

            // Trim dto's string properties
            triggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(triggerDto);

            // Default mapping 
            triggerDto.Adapt(trigger);
            trigger.LastModifiedByUserId = _userId;
            trigger.LastTriggeredTime = DateTimeOffset.UtcNow;
            trigger.CronExpression = CronScheduleUtil.BuildCronExpression(
                trigger.Frequency,
                trigger.Interval,
                trigger.Timezone,
                trigger.AtTime,
                trigger.Weekdays,
                trigger.MonthDays
            );
            trigger.NextTriggerTime = CronScheduleUtil.ComputeNextTriggerUtc(
                trigger.CronExpression,
                trigger.EffectiveDate,
                trigger.ExceptionHours,
                trigger.ExceptionWeekdays,
                trigger.ExceptionDates
            );

            // Update trigger
            _unitOfWork.TimeTriggerRepo.Update(trigger);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating time trigger");
                return serviceResponse;
            }

            // Handle updating the associated agents for the time trigger
            var currentAgentIds = triggerDto.Agents?
                .Select(a => a.Id)
                .ToList() ?? new List<Guid>();

            // Get the list of agent IDs currently linked to the time trigger
            var existingAgentIds = trigger.TimeTriggerFlowVersions
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
                var agentsToRemoveFlowVersions = trigger.TimeTriggerFlowVersions
                    .Where(w => agentsToRemove.Contains(w.FlowVersionId))
                    .ToList();

                _unitOfWork.TimeTriggerFlowRepo.Delete(agentsToRemoveFlowVersions);

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
                    var newTimeTriggerFlowVersions = agents.Select(s => new TimeTriggersFlowVersion()
                    {
                        TriggerId = trigger.Id,
                        FlowVersionId = s.Id,
                        CreatedByUserId = _userId,
                        LastModifiedByUserId = _userId
                    }).ToList();

                    // Insert the new time trigger flow versions
                    await _unitOfWork.TimeTriggerFlowRepo.InsertAsync(newTimeTriggerFlowVersions);

                    // Attempt to save changes to the database
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogInformation("Failed to add new time trigger flow versions.");
                        return serviceResponse;
                    }
                }
            }

            //Log a human-readable description of the cron schedule for reference
            _logger.LogInformation(CronScheduleUtil.BuildDescription(
                trigger.Frequency,
                trigger.Interval,
                trigger.Timezone,
                trigger.AtTime,
                trigger.Weekdays,
                trigger.MonthDays
            ));

            // Task successful
            serviceResponse.Data = trigger.Adapt<TimeTriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Time Trigger updated successfully";
            _logger.LogInformation("Time Trigger updated successfully with Id {Id}", triggerDto.Id);
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
            var trigger = await _unitOfWork.TimeTriggerRepo
                                            .GetByConditionAsync(w => w.Id == timeTriggerId)
                                            .Include(i => i.TimeTriggerFlowVersions)
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
            _unitOfWork.TimeTriggerRepo.Delete(trigger);

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
            List<TimeTrigger> timeTriggers = new();
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccess = new();

            // Personal mode → only current user's triggers
            if (isPersonal)
            {
                timeTriggers = await _unitOfWork.TimeTriggerRepo
                    .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                    .OrderByDescending(o => o.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .Include(i => i.TimeTriggerFlowVersions)
                        .ThenInclude(i2 => i2.FlowVersion)
                            .ThenInclude(i3 => i3.Flow)
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
                timeTriggers = await _unitOfWork.TimeTriggerRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId != _userId &&
                        (
                            w.IsTenantWideAccess ||
                            resourceAccess.Keys.Contains(w.Id)
                        )
                    )
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .Include(i => i.TimeTriggerFlowVersions)
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
            _logger.LogInformation("Time triggers retrieved successfully");
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
            var timeTrigger = await _unitOfWork.TimeTriggerRepo
                                            .GetByConditionAsync(w =>
                                                w.Id == timeTriggerId
                                            )
                                            .Include(a => a.CreatedByUser)
                                            .Include(a => a.LastModifiedByUser)
                                            .Include(a => a.TimeTriggerFlowVersions)
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
            var timeTriggers = await _unitOfWork.TimeTriggerRepo
                                            .GetByConditionAsync(w =>
                                                w.CreatedByUserId == _userId &&
                                                timeTriggerIds.Contains(w.Id))
                                            .Include(a => a.TimeTriggerFlowVersions)
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
            _unitOfWork.TimeTriggerRepo.Delete(timeTriggers);

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
            var trigger = await _unitOfWork.TimeTriggerRepo
                                            .GetByConditionAsync(w =>
                                                w.Id == timeTriggerId
                                            )
                                            .Include(a => a.TimeTriggerFlowVersions)
                                            .SingleOrDefaultAsync();

            // Return an error if the trigger doesn't exist
            if (trigger == null)
            {
                _logger.LogInformation("Trigger with ID {TriggerId} not found for user {UserId}.", timeTriggerId, _userId);
                serviceResponse.Message = "The trigger does not exist.";
                return serviceResponse;
            }

            // Verify current user has permission to view this trigger
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                trigger.Id,
                ResourceTypeEnum.Trigger,
                trigger.CreatedByUserId,
                trigger.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                _logger.LogInformation("User {UserId} attempted unauthorized access to time trigger {TriggerId}.", _userId, timeTriggerId);
                serviceResponse.Message = "You do not have access to view this time trigger.";
                return serviceResponse;
            }

            // Retrieve all agents for the current user
            var agents = await _unitOfWork.FlowVersionRepo
                                            .GetByConditionAsync(w =>
                                                trigger.TimeTriggerFlowVersions.Select(s => s.FlowVersionId).Contains(w.Id) &&
                                                w.IsPublished
                                            )
                                            .Include(f => f.Flow)
                                            .ProjectToType<AssignAgentTriggerDto>()
                                            .ToListAsync();

            // Set IsAssigned to true if the agent is already assigned to the trigger
            agents.ForEach(a =>
            {
                a.IsAssigned = (trigger.TimeTriggerFlowVersions ?? Enumerable.Empty<TimeTriggersFlowVersion>()).Any(mf => mf.FlowVersionId == a.Id);
                a.TriggerId = trigger.Id;
            });

            // Return the agents along with their assignment status
            serviceResponse.Data = agents;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Agents retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while retrieving agents for trigger {TriggerId}.", timeTriggerId);
            serviceResponse.Message = "An error occurred while retrieving agents from the trigger.";
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
namespace WorkspaceAPIs.Services;

public class TriggerService(
    ILogger<TriggerService> logger,
    IUnitOfWork unitOfWork,
    IHttpContextAccessor httpContextAccessor) : ITriggerService
{
    private readonly ILogger<TriggerService> _logger = logger;
    private readonly IUnitOfWork _unitOfWork = unitOfWork;
    private readonly Guid _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

    // Checks the availability of a trigger name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsTriggerNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
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

    // Insert new trigger and assign agents
    public async Task<ServiceResponse<TriggerDto>> CreateNewTriggerAsync(TriggerDto triggerDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<TriggerDto>
        {
            Data = null,
            Message = "Failed to insert trigger. Please try again"
        };

        try
        {
            // Validate trigger name uniqueness
            var triggerAlreadyExists = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(w => w.Name.ToLower() == triggerDto.Name.ToLower())
                .FirstOrDefaultAsync();

            // Trigger already exists
            if (triggerAlreadyExists != null)
            {
                _logger.LogInformation("Trigger already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A trigger with the same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto's string properties
            triggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(triggerDto);

            // Default mapping
            var newTrigger = triggerDto.Adapt<Triggers>();
            newTrigger.CreatedByUserId = _userId;
            newTrigger.LastModifiedByUserId = _userId;

            // Insert trigger
            await _unitOfWork.TriggerRepo.InsertAsync(newTrigger);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new trigger");
                return serviceResponse;
            }

            // Attempt to assign or update agents for the newly created trigger, if any agent IDs exist
            if (triggerDto.AgentIds != null && triggerDto.AgentIds.Any())
            {
                var agentResponse = await AssignOrUpdateAgentsAsync(newTrigger.Id, triggerDto.AgentIds);
                if (!agentResponse.Data)
                {
                    // If agent assignment fails, roll back the trigger creation
                    _unitOfWork.TriggerRepo.Delete(newTrigger);

                    // The delete will be saved in the next save operation
                    serviceResponse.Message = agentResponse.Message;
                    serviceResponse.StatusCode = agentResponse.StatusCode;
                    return serviceResponse;
                }
            }

            // Task successful
            serviceResponse.Data = newTrigger.Adapt<TriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Trigger created successfully";
            _logger.LogInformation("Trigger created successfully with id {Id} and agents assigned", newTrigger.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Remove an trigger by its ID
    public async Task<ServiceResponse<bool>> DeleteTriggerAsync(Guid triggerId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete trigger. Please try again"
        };

        try
        {
            // Try to get trigger
            var trigger = await _unitOfWork.TriggerRepo
                                            .GetByConditionAsync(m => m.Id == triggerId)
                                            .Include(a => a.TriggerFlowVersions)
                                            .FirstOrDefaultAsync();

            // Trigger does not exist
            if (trigger == null)
            {
                _logger.LogInformation($"Trigger does not exist");
                serviceResponse.Message = "Trigger does not exist";
                return serviceResponse;
            }

            // Delete trigger
            _unitOfWork.TriggerRepo.Delete(trigger);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting trigger");
                return serviceResponse;
            }


            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Trigger deleted successfully";

            _logger.LogInformation("Trigger deleted successfully of Id {Id}", triggerId);

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve all triggers associated with current user
    public async Task<ServiceResponse<IEnumerable<TriggerDto>>> GetTriggerListAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<TriggerDto>>
        {
            Data = null,
            Message = "Failed to retrieve triggers, Please try again."
        };

        try
        {
            // Try to get triggers
            var triggers = await _unitOfWork.TriggerRepo
                                            .GetByConditionAsync(m => m.CreatedByUserId == _userId)
                                            .OrderByDescending(o => o.CreatedOn)
                                            .Include(a => a.CreatedByUser)
                                            .Include(a => a.LastModifiedByUser)
                                            .Include(a => a.TriggerFlowVersions)
                                                .ThenInclude(fv => fv.FlowVersion)
                                                .ThenInclude(f => f.Flow)
                                            .AsNoTracking()
                                            .ToListAsync();

            // Task successful
            serviceResponse.Data = triggers.Adapt<IEnumerable<TriggerDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Triggers retrieved successfully";
            _logger.LogInformation("Triggers retrieved successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve an trigger by its ID
    public async Task<ServiceResponse<TriggerDto>> GetTriggerAsync(Guid triggerId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TriggerDto>
        {
            Data = null,
            Message = "Failed to retrieve trigger, Please try again"
        };

        try
        {
            // Try to get trigger
            var trigger = await _unitOfWork.TriggerRepo
                                            .GetByConditionAsync(m =>
                                                m.Id == triggerId && m.CreatedByUserId == _userId
                                            )
                                            .Include(a => a.CreatedByUser)
                                            .Include(a => a.LastModifiedByUser)
                                            .Include(a => a.TriggerFlowVersions)
                                                .ThenInclude(fv => fv.FlowVersion)
                                                .ThenInclude(f => f.Flow)
                                            .AsNoTracking()
                                            .FirstOrDefaultAsync();

            if (trigger == null)
            {
                serviceResponse.Message = "Trigger does not exist";
                _logger.LogInformation("There is no trigger with Id {Id}", triggerId);
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = trigger.Adapt<TriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Trigger retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Update an existence trigger
    public async Task<ServiceResponse<TriggerDto>> UpdateTriggerAsync(TriggerDto triggerDto)
    {
        // Initialize ServiceResponse with a failed response
        var serviceResponse = new ServiceResponse<TriggerDto>
        {
            Data = null,
            Message = "Failed to update trigger. Please try again"
        };

        try
        {
            // Validate trigger existence
            var trigger = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(m =>
                    m.Id == triggerDto.Id && m.CreatedByUserId == _userId
                )
                .FirstOrDefaultAsync();

            // Trigger does not exist
            if (trigger == null)
            {
                _logger.LogInformation("Trigger does not exist");
                serviceResponse.Message = "Trigger does not exist";
                return serviceResponse;
            }

            // Validate trigger name uniqueness
            var triggerAlreadyExists = await _unitOfWork.TriggerRepo
                .GetByConditionAsync(m =>
                    m.Name.ToLower() == triggerDto.Name.ToLower() &&
                    m.Id != triggerDto.Id
                )
                .FirstOrDefaultAsync();

            // Trigger already exists
            if (triggerAlreadyExists != null)
            {
                _logger.LogInformation("Trigger name already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A trigger with the same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto's string properties
            triggerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(triggerDto);

            // Default mapping 
            triggerDto.Adapt(trigger);
            trigger.LastModifiedByUserId = _userId;
            trigger.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update trigger
            _unitOfWork.TriggerRepo.Update(trigger);

            // Attempt to save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating trigger");
                return serviceResponse;
            }

            // Attempt to assign or update agents for the trigger, if any agent IDs exist
            if (triggerDto.AgentIds != null && triggerDto.AgentIds.Any())
            {
                var agentResponse = await AssignOrUpdateAgentsAsync(trigger.Id, triggerDto.AgentIds);
                if (!agentResponse.Data)
                {
                    // If agent assignment fails, roll back the trigger update
                    serviceResponse.Message = agentResponse.Message;
                    return serviceResponse;
                }
            }

            // Task successful
            serviceResponse.Data = trigger.Adapt<TriggerDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Trigger updated successfully";
            _logger.LogInformation("Trigger updated successfully with Id {Id}", triggerDto.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes multiple triggers by their IDs.
    public async Task<ServiceResponse<bool>> DeleteTriggersAsync(IEnumerable<Guid> triggerIds)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete triggers. Please try again"
        };

        try
        {
            // Validate triggers existence
            var triggers = await _unitOfWork.TriggerRepo
                                            .GetByConditionAsync(w =>
                                                w.CreatedByUserId == _userId &&
                                                triggerIds.Contains(w.Id))
                                            .Include(a => a.TriggerFlowVersions)
                                            .ToListAsync();

            // Triggers do not exist
            if (triggers.Count == 0)
            {
                _logger.LogInformation($"Triggers do not exist");
                serviceResponse.Message = "Triggers do not exist";
                return serviceResponse;
            }

            // TODO: Check trigger relationship with other entities

            // Delete triggers
            _unitOfWork.TriggerRepo.Delete(triggers);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting triggers");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{triggers.Count} triggers deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve agent list
    public async Task<ServiceResponse<IEnumerable<AssignAgentTriggerDto>>> GetAgentsByTriggerAsync(Guid triggerId)
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
            var trigger = await _unitOfWork.TriggerRepo
                                            .GetByConditionAsync(w =>
                                                w.Id == triggerId &&
                                                w.CreatedByUserId == _userId)
                                            .Include(a => a.TriggerFlowVersions)
                                            .FirstOrDefaultAsync();

            // Return an error if the trigger doesn't exist
            if (trigger == null)
            {
                _logger.LogInformation("Trigger with ID {TriggerId} not found for user {UserId}.", triggerId, _userId);
                serviceResponse.Message = "The trigger does not exist.";
                return serviceResponse;
            }

            // Retrieve all agents for the current user
            var agents = await _unitOfWork.FlowVersionRepo
                                            .GetByConditionAsync(w =>
                                                w.IsPublished &&
                                                w.CreatedByUserId == _userId)
                                            .Include(f => f.Flow)
                                            .ProjectToType<AssignAgentTriggerDto>()
                                            .ToListAsync();

            // Set IsAssigned to true if the agent is already assigned to the trigger
            agents.ForEach(a =>
            {
                a.IsAssigned = (trigger.TriggerFlowVersions ?? Enumerable.Empty<TriggersFlowVersion>()).Any(mf => mf.FlowVersionId == a.Id);
                a.TriggerId = trigger.Id;
            });

            // Return the agents along with their assignment status
            serviceResponse.Data = agents;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Agents retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while retrieving agents for trigger {TriggerId}.", triggerId);
            serviceResponse.Message = "An error occurred while retrieving agents from the trigger.";
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieve trigger select-option
    public async Task<ServiceResponse<IEnumerable<SelectOptionDto>>> GetTriggerToSelectOptionAsync()
    {
        // Initialize serviceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOptionDto>>
        {
            Data = null,
            Message = "Failed to retrieve triggers, please try again."
        };

        try
        {
            // Retrieve the triggers and map them to SelectOptionDto
            var triggersToSelect = await _unitOfWork.TriggerRepo.GetAllAsync()
                .ProjectToType<SelectOptionDto>()
                .AsNoTracking()
                .ToListAsync();

            // Set the serviceResponse
            serviceResponse.Data = triggersToSelect;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Triggers retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving the trigger list.");
        }

        return serviceResponse;
    }

    private async Task<ServiceResponse<bool>> AssignOrUpdateAgentsAsync(Guid triggerId, IEnumerable<Guid> agentIds)
    {
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to assign agents. Please try again."
        };

        try
        {
            // Validate that agent IDs are unique (no duplicates)
            if (agentIds.Count() != agentIds.Distinct().Count())
            {
                _logger.LogInformation("Duplicate agent IDs detected.");
                serviceResponse.Message = "Agent IDs cannot contain duplicates.";
                return serviceResponse;
            }

            // Validate agents and fetch valid agent entries
            var agents = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => agentIds.Contains(w.Id) && w.IsPublished)
                .AsNoTracking()
                .ToListAsync();

            var invalidAgentIds = agentIds.Except(agents.Select(a => a.Id)).ToList();
            if (invalidAgentIds.Count != 0)
            {
                _logger.LogInformation("Invalid agent IDs found: {InvalidAgentIds}", string.Join(", ", invalidAgentIds));
                serviceResponse.Message = $"The following agent IDs are invalid or do not belong to the user: {string.Join(", ", invalidAgentIds)}";
                return serviceResponse;
            }

            // Get existing trigger flows and determine changes
            var existingTriggerFlows = await _unitOfWork.TriggerFlowRepo
                        .GetByConditionAsync(mf => mf.TriggerId == triggerId)
                        .AsNoTracking()
                        .ToListAsync();

            var existingAgentIds = existingTriggerFlows.Select(mf => mf.FlowVersionId).ToList();

            var newAgentIds = agentIds.Except(existingAgentIds).ToList();
            var removedAgentIds = existingAgentIds.Except(agentIds).ToList();

            // Create new TriggerFlow entries for agents not already assigned
            var triggerFlowsToAdd = newAgentIds.Select(agentId => new TriggersFlowVersion
            {
                TriggerId = triggerId,
                FlowVersionId = agentId,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            }).ToList();

            // Remove existing TriggerFlow entries for agents that are no longer assigned
            var triggerFlowsToRemove = existingTriggerFlows
                .Where(mf => removedAgentIds.Contains(mf.FlowVersionId))
                .ToList();

            // Begin the transaction to insert and remove data
            if (triggerFlowsToAdd.Count != 0)
            {
                await _unitOfWork.TriggerFlowRepo.InsertAsync(triggerFlowsToAdd);

                // Attempt to save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Database save operation failed while assigning or inserting agents.");
                    serviceResponse.Message = "Failed to insert agent assignments for the trigger.";
                    return serviceResponse;
                }
            }

            if (triggerFlowsToRemove.Any())
            {
                _unitOfWork.TriggerFlowRepo.Delete(triggerFlowsToRemove);

                // Attempt to save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("Database save operation failed while assigning or deleting agents.");
                    serviceResponse.Message = "Failed to insert agent assignments for the trigger.";
                    return serviceResponse;
                }
            }
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{newAgentIds.Count} agents assigned and {removedAgentIds.Count} agents removed from the trigger.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while assigning agents.");
            return serviceResponse;
        }

        return serviceResponse;
    }
}
namespace WorkspaceAPIs.Services;

public class QueueTableService : IQueueTableService
{
    private readonly ILogger<QueueTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IResourceShareService _resourceShareService;
    private readonly IResourceFlowAccessService _resourceFlowAccessService;
    private readonly IUserManagementGuardService _userManagementGuardService;
    private readonly Guid _userId;
    private readonly Guid _tenantId;
    private readonly ICurrentTenantService _currentTenantService;

    public QueueTableService(
        ILogger<QueueTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        IResourceShareService resourceShareService,
        IResourceFlowAccessService resourceFlowAccessService,
        ICurrentTenantService currentTenantService,
        IUserManagementGuardService userManagementGuardService)
    {
        // Set _userId and _tenantId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
        _resourceShareService = resourceShareService;
        _resourceFlowAccessService = resourceFlowAccessService;
        _currentTenantService = currentTenantService;
        _userManagementGuardService = userManagementGuardService;
    }

    // Checks the availability of a queue name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsQueueNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check queue name availability. Please try again"
        };

        try
        {
            // Validate queue uniqueness within the current environment
            var queueAlreadyExists = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // Queue already exists
            if (queueAlreadyExists != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A queue with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Fetches all queues with optional filters
    public async Task<ServiceResponse<IEnumerable<QueuesTableDto>>> GetAllQueuesAsync(bool isPersonal)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<QueuesTableDto>>
        {
            Data = null,
            Message = "Failed to retrive queues. Please try again"
        };

        try
        {
            // Retrieve queues based on ownership or access permissions
            List<Queue> queues = new();
            Dictionary<Guid, ResourceAccessTypeEnum> resourceAccess = new();

            if (isPersonal)
            {
                // Return only queues created by current user
                queues = await _unitOfWork.QueueRepo
                    .GetByConditionAsync(w => w.CreatedByUserId == _userId && w.EnvType == _currentTenantService.CurrentEnvType)
                    .OrderByDescending(o => o.CreatedOn)
                    .Include(i => i.QueueTransactions)
                    .Include(i => i.CreatedByUser)
                    .ToListAsync();
            }
            else
            {
                // Get accessible queue IDs with their access levels
                resourceAccess = await _resourceShareService.GetAccessibleResourcesWithAccessAsync(
                    _userId,
                    ResourceTypeEnum.Queue,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    }
                );

                // Retrieve all accessible queues.
                // A queue is considered shared/accessible when the current user:
                //   - has a ResourceShare record granting access, OR
                //   - is tenant-wide accessible, OR
                //   - has a legacy QueueUser record (kept in sync with the Assist
                //     "my queues" screen so both sections show the same queues).
                queues = await _unitOfWork.QueueRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId != _userId &&
                        w.EnvType == _currentTenantService.CurrentEnvType &&
                        (
                            w.IsTenantWideAccess ||
                            resourceAccess.Keys.Contains(w.Id) ||
                            (w.QueueUsers != null && w.QueueUsers.Any(a => a.UserId == _userId))
                        )
                    )
                    .Include(i => i.QueueTransactions)
                    .Include(i => i.CreatedByUser)
                    .OrderByDescending(o => o.CreatedOn)
                    .ToListAsync();
            }

            // Map to DTOs
            var queueDtoList = queues.Adapt<List<QueuesTableDto>>();
            await PopulateAgentNamesAsync(queueDtoList);

            // Assign access levels:
            // - Personal queues are always owned by the current user.
            // - Shared/tenant-wide queues use the granted permissions, defaulting to View.
            queueDtoList.ForEach(fe =>
            {
                fe.AccessLevel = isPersonal
                    ? ResourceAccessTypeEnum.Owner
                    : resourceAccess.GetValueOrDefault(fe.Id, ResourceAccessTypeEnum.View);
            });

            serviceResponse.Data = queueDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queues retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves all queues assigned to a specific agent (flow version)
    public async Task<ServiceResponse<IEnumerable<QueuesTableDto>>> GetQueuesByAgentAsync(Guid flowVersionId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<QueuesTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve queues for the agent. Please try again."
        };

        try
        {
            // IMPORTANT NOTE: grants are per-flow and space-agnostic, so the version lookup
            // bypasses the space filter and applies the tenant explicitly instead.
            var flowId = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w => w.Id == flowVersionId && w.TenantId == _currentTenantService.CurrentTenantId)
                .IgnoreQueryFilters()
                .Select(w => w.FlowId)
                .FirstOrDefaultAsync();

            if (flowId == Guid.Empty)
            {
                serviceResponse.StatusCode = 404;
                serviceResponse.Message = "The agent does not exist.";
                return serviceResponse;
            }

            var queueIdsByFlow = await _resourceFlowAccessService.GetAssignedResourceIdsAsync(
                ResourceTypeEnum.Queue,
                new[] { flowId });
            var queueIds = queueIdsByFlow.GetValueOrDefault(flowId) ?? new HashSet<Guid>();

            var queues = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    queueIds.Contains(w.Id) &&
                    w.EnvType == _currentTenantService.CurrentEnvType)
                .OrderByDescending(o => o.CreatedOn)
                .Include(i => i.QueueTransactions)
                .Include(i => i.CreatedByUser)
                .ToListAsync();

            // Map to DTOs
            var queueDtoList = queues.Adapt<List<QueuesTableDto>>();
            await PopulateAgentNamesAsync(queueDtoList);

            queueDtoList.ForEach(fe =>
            {
                fe.AccessLevel = ResourceAccessTypeEnum.Owner;
            });

            serviceResponse.Data = queueDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queues retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Searches for queues by name
    public async Task<ServiceResponse<IEnumerable<QueuesTableDto>>> SearchQueuesAsync(string queueName, bool isPersonal)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<QueuesTableDto>>
        {
            Data = null,
            Message = "Failed to search queues. Please try again."
        };

        try
        {
            List<Queue> queues;

            if (isPersonal)
            {
                // Return only queues created by current user
                queues = await _unitOfWork.QueueRepo
                    .GetByConditionAsync(w =>
                        w.CreatedByUserId == _userId &&
                        w.EnvType == _currentTenantService.CurrentEnvType &&
                        w.Name.ToLower().Contains(queueName.ToLower())
                    )
                    .Include(i => i.QueueTransactions)
                    .Include(i => i.CreatedByUser)
                    .OrderByDescending(o => o.CreatedOn)
                    .ToListAsync();
            }
            else
            {
                // Retrieve queue IDs accessible by current user
                var accessibleQueueIds = await _resourceShareService.GetAccessibleResourceIdsAsync(
                    _userId,
                    ResourceTypeEnum.Queue,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                        ResourceAccessTypeEnum.View,
                        ResourceAccessTypeEnum.Edit,
                    }
                );

                // Retrieve all accessible queues
                queues = await _unitOfWork.QueueRepo
                    .GetByConditionAsync(w =>
                        w.Name.ToLower().Contains(queueName.ToLower()) &&
                        w.EnvType == _currentTenantService.CurrentEnvType &&
                        (
                            w.CreatedByUserId == _userId ||
                            w.IsTenantWideAccess ||
                            accessibleQueueIds.Contains(w.Id)
                        )
                     )
                    .Include(i => i.QueueTransactions)
                    .Include(i => i.CreatedByUser)
                    .OrderByDescending(o => o.CreatedOn)
                    .ToListAsync();
            }

            // Task successful
            var queueDtoList = queues.Adapt<List<QueuesTableDto>>();
            await PopulateAgentNamesAsync(queueDtoList);
            serviceResponse.Data = queueDtoList;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queues retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Fetches the details of a specific queue by its ID
    public async Task<ServiceResponse<QueuesTableDto>> GetQueueByIdAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<QueuesTableDto>
        {
            Data = null,
            StatusCode = 400,
            Message = "Queue not found"
        };

        try
        {
            // Get the specific queue
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Id == id && w.CreatedByUserId == _userId && w.EnvType == _currentTenantService.CurrentEnvType)
                .FirstOrDefaultAsync();

            // Check if queue exists
            if (queue == null)
            {
                serviceResponse.Message = "Queue not found";
                return serviceResponse;
            }

            // Validate view permission
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                queue.Id,
                ResourceTypeEnum.Queue,
                queue.CreatedByUserId,
                queue.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canView)
            {
                _logger.LogWarning("Unauthorized queue access. User {UserId}, Queue {QueueId}", _userId, id);
                serviceResponse.Message = "You do not have access to this queue.";
                return serviceResponse;
            }

            // Task successful
            var queueDto = queue.Adapt<QueuesTableDto>();
            await PopulateAgentNamesAsync(new List<QueuesTableDto> { queueDto });
            serviceResponse.Data = queueDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves a queue by its name.
    public async Task<ServiceResponse<QueuesTableDto>> GetQueueByNameAsync(string queueName)
    {
        // Initialize the default failure response.
        var serviceResponse = new ServiceResponse<QueuesTableDto>
        {
            Data = null,
            Message = "Failed to retrieve the queue. Please try again."
        };

        try
        {
            // Retrieve the queue matching the specified name within the current environment.
            // Filter explicitly by the current tenant and bypass the global tenant/space query
            // filters so runner/node-originated calls (which have no space context) can resolve
            // queues scoped to the executing flow's tenant.
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == queueName.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .Include(i => i.QueueTransactions)
                .Include(i => i.QueueUsers)
                .Include(i => i.CreatedByUser)
                .FirstOrDefaultAsync();

            // Verify that the queue exists.
            if (queue == null)
            {
                serviceResponse.Message = $"Queue '{queueName}' was not found.";
                return serviceResponse;
            }

            // Verify that the user has permission to view the queue.
            var (canView, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                queue.Id,
                ResourceTypeEnum.Queue,
                queue.CreatedByUserId,
                queue.IsTenantWideAccess,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.View,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            // A user can also be associated with a queue through a legacy QueueUser
            // record (used by the Assist "my queues" screen and agent queues), which
            // is not represented as a ResourceShare. Mirror the list endpoints so
            // those users can resolve the queue's full schema.
            var hasQueueUserAccess = queue.QueueUsers?.Any(a => a.UserId == _userId) == true;

            if (!canView && !hasQueueUserAccess)
            {
                _logger.LogWarning(
                    "Unauthorized queue access. User {UserId}, Queue {QueueName}",
                    _userId,
                    queueName);

                serviceResponse.Message = "You do not have permission to access this queue.";
                return serviceResponse;
            }

            // Populate the successful response.
            var queueDto = queue.Adapt<QueuesTableDto>();
            await PopulateAgentNamesAsync(new List<QueuesTableDto> { queueDto });
            serviceResponse.Data = queueDto;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving queue by name {QueueName}", queueName);
        }

        return serviceResponse;
    }

    // Creates a new queue
    public async Task<ServiceResponse<QueuesTableDto>> InsertQueueAsync(QueuesTableDto queuesTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<QueuesTableDto>
        {
            Data = null,
            Message = "Failed to create queue. Please try again"
        };

        try
        {
            // Block creating new queues while in the PROD environment.
            var prodBlock = CreateResourceGuard.Validate<QueuesTableDto>(
                _currentTenantService.CurrentEnvType,
                "queue");
            if (prodBlock != null)
            {
                return prodBlock;
            }

            // Validate queue uniqueness within the current environment
            var queueAlreadyExists = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    w.TenantId == _currentTenantService.CurrentTenantId &&
                    w.Name.ToLower() == queuesTableDto.Name.ToLower() &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync();

            // Queue already exists
            if (queueAlreadyExists != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A queue with the same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            queuesTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(queuesTableDto);

            // Normalize an empty credential name to null so the database stays clean.
            if (queuesTableDto.CredentialName == string.Empty)
            {
                queuesTableDto.CredentialName = null;
            }

            // Default mapping
            var newQueue = queuesTableDto.Adapt<Queue>();
            newQueue.CreatedByUserId = _userId;
            newQueue.LastModifiedByUserId = _userId;
            newQueue.EnvType = _currentTenantService.CurrentEnvType;

            // Insert queue 
            await _unitOfWork.QueueRepo.InsertAsync(newQueue);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Assign creator ownership
            if (!await _resourceShareService.AssignOwnerAsync(_userId, newQueue.Id, ResourceTypeEnum.Queue))
            {
                _logger.LogWarning("Failed assigning queue ownership. Queue {QueueId}", newQueue.Id);
                serviceResponse.Message = "Failed assigning ownership.";
                return serviceResponse;
            }

            // If the queue type is 'User', create an associated QueueUser entry
            if (newQueue.Type == QueueTypesEnum.User)
            {
                var queueUser = new QueueUser()
                {
                    UserId = _userId,
                    QueueId = newQueue.Id,
                    AccessType = QueueWorkItemAccessTypesEnum.FullAccess,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId,
                    TenantId = _tenantId
                };

                // Insert the new QueueUser into the database
                await _unitOfWork.QueueUserRepo.InsertAsync(queueUser);

                // Save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }
            }

            // Task successful
            serviceResponse.Data = newQueue.Adapt<QueuesTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing queue
    public async Task<ServiceResponse<QueuesTableDto>> UpdateQueueAsync(QueuesTableDto queuesTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<QueuesTableDto>
        {
            Data = null,
            Message = "Failed to update queue. Please try again"
        };

        try
        {
            // Validate queue existence
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Id == queuesTableDto.Id && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            // Queue does not exist
            if (queue == null)
            {
                serviceResponse.Message = "Queue does not exist";
                return serviceResponse;
            }

            // Require OM for PROD edits based on the persisted queue environment.
            var prodUpdateBlock = ProdResourceUpdateGuard.Validate<QueuesTableDto>(
                queue.EnvType,
                _userManagementGuardService.HasRole(CustomRolesEnum.OM.ToString()),
                "queue");
            if (prodUpdateBlock != null)
            {
                return prodUpdateBlock;
            }

            // Validate edit permission
            var (canEdit, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                queue.Id,
                ResourceTypeEnum.Queue,
                queue.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                    ResourceAccessTypeEnum.Edit,
                }
            );

            if (!canEdit)
            {
                _logger.LogWarning("Unauthorized queue update. User {UserId}, Queue {QueueId}", _userId, queue.Id);
                serviceResponse.Message = "You do not have access to update this queue.";
                return serviceResponse;
            }

            // Validate queue name uniqueness within the current environment
            var queueAlreadyExists = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    w.Name.ToLower() == queuesTableDto.Name.ToLower() &&
                    w.Id != queuesTableDto.Id &&
                    w.EnvType == _currentTenantService.CurrentEnvType
                )
                .FirstOrDefaultAsync();

            // Queue already exists
            if (queueAlreadyExists != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A queue with the same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Normalize and trim all string properties in the DTO before comparing values.
            queuesTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(queuesTableDto);

            // Update only the properties whose values have changed to avoid unnecessary modifications.
            if (queue.Description != queuesTableDto.Description)
            {
                queue.Description = queuesTableDto.Description;
            }

            var inputSchema = System.Text.Json.JsonSerializer.Serialize(
                queuesTableDto.InputSchema,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }
            );
            if (queue.InputSchema != inputSchema)
            {
                queue.InputSchema = inputSchema;
            }

            var statuses = System.Text.Json.JsonSerializer.Serialize(
                queuesTableDto.Statuses,
                new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                }
            );
            if (queue.Statuses != statuses)
            {
                queue.Statuses = statuses;
            }

            if (queuesTableDto.RouteToQueues != null && queue.RouteToQueues != queuesTableDto.RouteToQueues)
            {
                queue.RouteToQueues = queuesTableDto.RouteToQueues;
            }

            // Normalize an empty credential name to null so the database stays clean.
            if (queuesTableDto.CredentialName == string.Empty)
            {
                queuesTableDto.CredentialName = null;
            }

            if (queue.CredentialName != queuesTableDto.CredentialName)
            {
                queue.CredentialName = queuesTableDto.CredentialName;
            }

            if (queuesTableDto.IsDisabled.HasValue && queue.IsDisabled != queuesTableDto.IsDisabled.Value)
            {
                queue.IsDisabled = queuesTableDto.IsDisabled.Value;
            }

            if (queue.IsStoredEncrypted != queuesTableDto.IsStoredEncrypted)
            {
                queue.IsStoredEncrypted = queuesTableDto.IsStoredEncrypted;
            }

            if (queue.IsUniqueReferencesEnforced != queuesTableDto.IsUniqueReferencesEnforced)
            {
                queue.IsUniqueReferencesEnforced = queuesTableDto.IsUniqueReferencesEnforced;
            }

            if (queue.IsTenantWideAccess != queuesTableDto.IsTenantWideAccess)
            {
                queue.IsTenantWideAccess = queuesTableDto.IsTenantWideAccess;
            }

            if (queue.MaximumRetryAttempts != queuesTableDto.MaximumRetryAttempts)
            {
                queue.MaximumRetryAttempts = queuesTableDto.MaximumRetryAttempts;
            }

            if (queue.OutputSchema != queuesTableDto.OutputSchema)
            {
                queue.OutputSchema = queuesTableDto.OutputSchema;
            }

            if (queue.ShouldRetryAbandonedItems != queuesTableDto.ShouldRetryAbandonedItems)
            {
                queue.ShouldRetryAbandonedItems = queuesTableDto.ShouldRetryAbandonedItems;
            }

            if (queue.ShouldRetryFailedItems != queuesTableDto.ShouldRetryFailedItems)
            {
                queue.ShouldRetryFailedItems = queuesTableDto.ShouldRetryFailedItems;
            }

            if (queue.Type != queuesTableDto.Type)
            {
                queue.Type = queuesTableDto.Type;
            }

            if (queue.ProcessingMode != queuesTableDto.ProcessingMode)
            {
                queue.ProcessingMode = queuesTableDto.ProcessingMode;
            }

            // Update audit information for the modified entity.
            queue.LastModifiedByUserId = _userId;
            queue.LastModifiedOn = DateTimeOffset.UtcNow;

            _unitOfWork.QueueRepo.Update(queue);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = queue.Adapt<QueuesTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a specific queue by its ID
    public async Task<ServiceResponse<bool>> DeleteQueueAsync(Guid queueId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete queue. Please try again"
        };

        try
        {
            // Validate queue existence
            var queue = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w => w.Id == queueId && w.EnvType == _currentTenantService.CurrentEnvType)
                .SingleOrDefaultAsync();

            // Queue does not exist
            if (queue == null)
            {
                serviceResponse.Message = "Queue does not exist";
                return serviceResponse;
            }

            // PROD-guard: block deletion of PROD queues or queues with a same-name PROD twin.
            var guardBlock = await DeleteResourceGuard.ValidateAsync(
                _unitOfWork.QueueRepo,
                queue.EnvType,
                queue.Name,
                w => w.Name.ToLower() == queue.Name.ToLower() &&
                     w.EnvType == ConfigureEnvironmentType.Prod &&
                     w.TenantId == queue.TenantId &&
                     w.SpaceId == queue.SpaceId,
                "queue");
            if (guardBlock != null)
            {
                return guardBlock;
            }

            // Validate delete permission
            var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                _userId,
                queue.Id,
                ResourceTypeEnum.Queue,
                queue.CreatedByUserId,
                false,
                new[]
                {
                    ResourceAccessTypeEnum.Owner,
                }
            );

            if (!canDelete)
            {
                serviceResponse.Message = "You do not have access to delete this queue.";
                return serviceResponse;
            }

            // Remove access mappings
            await _resourceShareService.DeleteResourceSharesAsync(queue.Id, ResourceTypeEnum.Queue);
            await _resourceFlowAccessService.DeleteResourceFlowAccessesAsync(ResourceTypeEnum.Queue, queue.Id);

            // Delete queue
            _unitOfWork.QueueRepo.Delete(queue);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes multiple queues by their IDs.
    public async Task<ServiceResponse<bool>> DeleteQueuesAsync(List<Guid> queueIds)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete queues. Please try again"
        };

        try
        {
            // Validate queue existence.
            var queues = await _unitOfWork.QueueRepo
                .GetByConditionAsync(w =>
                    w.EnvType == _currentTenantService.CurrentEnvType &&
                    queueIds.Contains(w.Id))
                .ToListAsync();

            // Queues do not exist.
            if (queues.Count == 0)
            {
                serviceResponse.Message = "Queues do not exist";
                return serviceResponse;
            }

            // Validate delete permission + PROD-guard for all queues
            var blockedNames = new List<string>();
            foreach (var queue in queues)
            {
                var (canDelete, accessLevel) = await _resourceShareService.GetResourceAccessAsync(
                    _userId,
                    queue.Id,
                    ResourceTypeEnum.Queue,
                    queue.CreatedByUserId,
                    false,
                    new[]
                    {
                        ResourceAccessTypeEnum.Owner,
                    }
                );

                if (!canDelete)
                {
                    serviceResponse.Message =
                        "You do not have access to delete one or more queues.";

                    return serviceResponse;
                }

                // PROD-guard: block the whole batch if any queue is PROD or has a same-name PROD twin.
                var guardBlock = await DeleteResourceGuard.ValidateAsync(
                    _unitOfWork.QueueRepo,
                    queue.EnvType,
                    queue.Name,
                    w => w.Name.ToLower() == queue.Name.ToLower() &&
                         w.EnvType == ConfigureEnvironmentType.Prod &&
                         w.TenantId == queue.TenantId &&
                         w.SpaceId == queue.SpaceId,
                    "queue");
                if (guardBlock != null)
                {
                    blockedNames.Add(queue.Name);
                }
            }

            // Reject the entire batch when any selected queue is protected by the PROD guard.
            if (blockedNames.Count > 0)
            {
                serviceResponse.Message =
                    $"Cannot delete the following queue(s) because they are published (PROD) or have a same-name PROD version: {string.Join(", ", blockedNames)}";
                return serviceResponse;
            }

            // TODO: Check queues relationship with other entities

            // Remove access mappings
            await _resourceShareService.DeleteResourceSharesAsync(queueIds, ResourceTypeEnum.Queue);
            await _resourceFlowAccessService.DeleteResourceFlowAccessesAsync(ResourceTypeEnum.Queue, queueIds);

            // Delete queues
            _unitOfWork.QueueRepo.Delete(queues);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{queueIds.Count} queues deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Assigns multiple users to a queue.
    public async Task<ServiceResponse<bool>> AssignUsersAsync(Guid queueId, IEnumerable<Guid> userIds)
    {
        // Initialize serviceResponse with failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to assign users to the queue. Please try again."
        };

        try
        {
            // Ensure user IDs are unique.
            if (userIds.Count() != userIds.Distinct().Count())
            {
                serviceResponse.Message = "User IDs cannot contain duplicates.";
                return serviceResponse;
            }

            // Check if the queue exists
            var queue = await _unitOfWork.QueueRepo
                        .GetByConditionAsync(w => w.Id == queueId)
                        .Include(i => i.QueueUsers)
                        .FirstOrDefaultAsync();

            if (queue == null)
            {
                // If the queue doesn't exist or doesn't belong to the current user, return failure.
                serviceResponse.Message = "The queue does not exist or doesn't belong to you.";
                return serviceResponse;
            }

            // Retrieve users and validate if their IDs are correct.
            var validUsers = await _unitOfWork.WorkspaceUserRepo
                        .GetByConditionAsync(u => userIds.Contains(u.Id))
                        .AsNoTracking()
                        .ToListAsync();

            var invalidUserIds = userIds.Except(validUsers.Select(u => u.Id)).ToList();

            if (invalidUserIds.Any())
            {
                // If any user IDs are invalid, return failure.
                serviceResponse.Message = $"The following user IDs are invalid or do not belong to the current user: {string.Join(", ", invalidUserIds)}";
                return serviceResponse;
            }

            // Identify users already assigned to the queue.
            var currentQueueUsers = queue?.QueueUsers?.ToList() ?? new List<QueueUser>();
            var currentlyAssignedUserIds = currentQueueUsers.Select(q => q.UserId).ToList();

            // Determine the new users to assign and users to remove.
            var usersToAssign = userIds.Except(currentlyAssignedUserIds).ToList();
            var usersToRemove = currentlyAssignedUserIds.Except(userIds).ToList();

            // If there are no changes (no users to assign or remove), return a message.
            if (!usersToAssign.Any() && !usersToRemove.Any())
            {
                serviceResponse.Message = "No changes made to the queue assignments.";
                return serviceResponse;
            }

            // Create new QueueUser entries for users to be assigned to the queue.
            var newQueueUsers = usersToAssign.Select(userId => new QueueUser()
            {
                QueueId = queueId,
                UserId = userId,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId,
                TenantId = _tenantId
            }).ToList();

            // Identify existing QueueUser entries for users to be removed.
            var queueUsersToRemove = currentQueueUsers
                .Where(q => usersToRemove.Contains(q.UserId))
                .ToList();

            // Begin the transaction to insert new users and remove the old ones.
            if (newQueueUsers.Any())
            {
                await _unitOfWork.QueueUserRepo.InsertAsync(newQueueUsers);
            }

            if (queueUsersToRemove.Any())
            {
                _unitOfWork.QueueUserRepo.Delete(queueUsersToRemove);
            }

            // Attempt to save changes to the database.
            if (!await _unitOfWork.SaveAsync())
            {
                // If saving fails, return failure response.
                serviceResponse.Message = "Failed to update user assignments for the queue.";
                return serviceResponse;
            }

            // Return success with the count of users assigned and removed.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{usersToAssign.Count} users assigned and {usersToRemove.Count} users removed from the queue.";
        }
        catch (Exception ex)
        {
            // Log any unexpected error.
            _logger.LogError(ex, "An unexpected error occurred while assigning users to the queue.");
            return serviceResponse;
        }

        // Return the service response.
        return serviceResponse;
    }

    // Retrieve user list
    public async Task<ServiceResponse<IEnumerable<AssignUserQueueDto>>> GetUsersAsync(Guid queueId)
    {
        // Initialize the response with a failed result
        var serviceResponse = new ServiceResponse<IEnumerable<AssignUserQueueDto>>
        {
            Data = null,
            Message = "Failed to retrieve users. Please try again."
        };

        try
        {
            // Check if the queue exists and belongs to the current user
            var queue = await _unitOfWork.QueueRepo
                                            .GetByConditionAsync(w => w.Id == queueId)
                                            .Include(i => i.QueueUsers)
                                            .FirstOrDefaultAsync();

            // Return an error if the queue doesn't exist
            if (queue == null)
            {
                serviceResponse.Message = "The queue does not exist.";
                return serviceResponse;
            }


            // Retrieve all users for the current user
            var users = await _unitOfWork.WorkspaceUserRepo
                                            .GetByConditionAsync(w => w.TenantId == _tenantId)
                                            .ProjectToType<AssignUserQueueDto>()
                                            .ToListAsync();

            // Set IsAssigned to true if the user is already assigned to the queue
            users.ForEach(fe =>
            {
                fe.IsAssigned = (queue.QueueUsers ?? Enumerable.Empty<QueueUser>()).Any(a => a.UserId == fe.Id);
                fe.QueueId = queue.Id;
            });

            // Return the users along with their assignment status
            serviceResponse.Data = users;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while retrieving users for queue {QueueId}.", queueId);
            serviceResponse.Message = "An error occurred while retrieving users from the queue.";
            return serviceResponse;
        }

        return serviceResponse;
    }

    private async Task PopulateAgentNamesAsync(List<QueuesTableDto> queueDtoList)
    {
        var agentNamesByQueue = await _resourceFlowAccessService.GetAssignedFlowNamesAsync(
            ResourceTypeEnum.Queue,
            queueDtoList.Select(queue => queue.Id));
        queueDtoList.ForEach(queue =>
            queue.AgentsNames = agentNamesByQueue.GetValueOrDefault(queue.Id) ?? new List<string>());
    }

}

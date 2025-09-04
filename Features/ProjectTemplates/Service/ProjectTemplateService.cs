namespace WorkspaceAPIs.Services
{
    public class ProjectTemplateService : IProjectTemplateService
    {
        private readonly ILogger<ProjectTemplateService> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IUploadFileService _uploadFileService;
        private readonly Guid _userId;
        private readonly Guid _tenantId;
        private readonly Guid _spaceId;

        public ProjectTemplateService(
            ILogger<ProjectTemplateService> logger,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor httpContextAccessor,
            IUploadFileService uploadFileService)
        {
            // Set _userId
            _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
            _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
            _spaceId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("spid") ?? Guid.Empty.ToString());

            _logger = logger;
            _unitOfWork = unitOfWork;
            _uploadFileService = uploadFileService;
        }

        // Retrieve all project templates list
        public async Task<ServiceResponse<IEnumerable<ProjectTemplateDto>>> GetAllProjectTemplatesAsync()
        {
            // Initialize default response with failure message
            var serviceResponse = new ServiceResponse<IEnumerable<ProjectTemplateDto>>
            {
                Data = null,
                Message = "Failed to retrieve templates. Please try again later."
            };

            try
            {
                // Fetch project templates filtered by tenant and user, ordered by usage count, including related data
                var projectTemplates = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w =>
                        w.TenantId == _tenantId &&
                        w.CreatedByUserId == _userId
                    )
                    .OrderByDescending(o => o.UsageCount)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.TemplateResources)
                    .ToListAsync();

                // Map entities to DTOs and set success response
                serviceResponse.Data = projectTemplates.Adapt<IEnumerable<ProjectTemplateDto>>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project templates retrieved successfully.";

                // Log success with count and context
                _logger.LogInformation("Successfully retrieved {Count} project templates for user {UserId} in tenant {TenantId}.",
                    projectTemplates.Count, _userId, _tenantId);
            }
            catch (Exception ex)
            {
                // Log any errors during retrieval
                _logger.LogError(ex, "Error occurred while fetching trending templates for user {UserId} in tenant {TenantId}.", _userId, _tenantId);
            }

            return serviceResponse;
        }

        // Retrieves a specific project template by its ID.
        public async Task<ServiceResponse<ProjectTemplateDto>> GetProjectTemplateAsync(Guid projectTemplateId)
        {
            // Initialize default response with failure message
            var serviceResponse = new ServiceResponse<ProjectTemplateDto>
            {
                Data = null,
                Message = "Failed to retrieve template. Please try again later."
            };

            try
            {
                // Query for a project template by ID including related user and resources
                var projectTemplate = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w => w.Id == projectTemplateId)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.TemplateResources)
                    .FirstOrDefaultAsync();

                // Handle not found case
                if (projectTemplate == null)
                {
                    _logger.LogWarning("Project template with ID {ProjectTemplateId} not found.", projectTemplateId);
                    serviceResponse.Message = "Project template not found.";
                    return serviceResponse;
                }

                // Map entity to DTO and set success response
                serviceResponse.Data = projectTemplate.Adapt<ProjectTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project template retrieved successfully.";

                // Log successful retrieval
                _logger.LogInformation("Successfully retrieved project template with ID {ProjectTemplateId}.", projectTemplateId);
            }
            catch (Exception ex)
            {
                // Log exceptions
                _logger.LogError(ex, "An error occurred while fetching the project template with ID {ProjectTemplateId}.", projectTemplateId);
                serviceResponse.Message = "An unexpected error occurred while retrieving the template.";
            }

            return serviceResponse;
        }

        // Retrieves a specific project template by its reference ID.
        public async Task<ServiceResponse<ProjectTemplateDto>> GetProjectTemplateByRefIdAsync(Guid refId)
        {
            var serviceResponse = new ServiceResponse<ProjectTemplateDto>
            {
                Data = null,
                Message = "Failed to retrieve template. Please try again later."
            };

            try
            {
                // Query for a project template by reference ID including related user and resources
                var projectTemplate = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w => w.RefId == refId)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.TemplateResources)
                    .FirstOrDefaultAsync();

                if (projectTemplate == null)
                {
                    _logger.LogWarning("Project template with reference ID {RefId} not found.", refId);
                    serviceResponse.Message = "Project template not found.";
                    return serviceResponse;
                }

                serviceResponse.Data = projectTemplate.Adapt<ProjectTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project template retrieved successfully.";

                _logger.LogInformation("Successfully retrieved project template with reference ID {RefId}.", refId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while fetching the project template with reference ID {RefId}.", refId);
                serviceResponse.Message = "An unexpected error occurred while retrieving the template.";
            }

            return serviceResponse;
        }

        // Creates a new project template.
        public async Task<ServiceResponse<ProjectTemplateDto>> InsertProjectTemplateAsync(ProjectTemplateDto projectTemplateDto)
        {
            // Initialize default response with failure message
            var serviceResponse = new ServiceResponse<ProjectTemplateDto>
            {
                Data = null,
                Message = "Failed to insert template. Please try again."
            };

            try
            {
                // Check for existing template with same RefId to avoid duplicates
                var existingTemplate = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w => w.RefId == projectTemplateDto.RefId)
                    .FirstOrDefaultAsync();

                if (existingTemplate != null)
                {
                    _logger.LogWarning("Attempt to insert duplicate project template with RefId {RefId}.", projectTemplateDto.RefId);
                    serviceResponse.Message = "A template with the same reference ID already exists.";
                    serviceResponse.StatusCode = 409;
                    return serviceResponse;
                }

                // Trim string properties to clean data
                projectTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(projectTemplateDto);

                // Map DTO to entity and set initial properties
                var newProjectTemplate = projectTemplateDto.Adapt<ProjectTemplate>();
                newProjectTemplate.Version = 1;
                newProjectTemplate.CreatedByUserId = _userId;
                newProjectTemplate.LastModifiedByUserId = _userId;

                // Insert new template
                await _unitOfWork.ProjectTemplateRepo.InsertAsync(newProjectTemplate);

                // Save changes and check success
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("SaveChanges failed when inserting new project template with RefId {RefId}.", projectTemplateDto.RefId);
                    return serviceResponse;
                }

                // Map saved entity back to DTO and set success response
                serviceResponse.Data = newProjectTemplate.Adapt<ProjectTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project template inserted successfully.";

                // Log successful insert
                _logger.LogInformation("Successfully inserted new project template with RefId {RefId} by user {UserId}.",
                    projectTemplateDto.RefId, _userId);
            }
            catch (Exception ex)
            {
                // Log exceptions
                _logger.LogError(ex, "An error occurred while inserting a project template with RefId {RefId}.", projectTemplateDto.RefId);
            }

            return serviceResponse;
        }

        // Updates an existing project template.
        public async Task<ServiceResponse<ProjectTemplateDto>> UpdateProjectTemplateAsync(ProjectTemplateDto projectTemplateDto)
        {
            // Initialize default response with failure message
            var serviceResponse = new ServiceResponse<ProjectTemplateDto>
            {
                Data = null,
                Message = "Failed to update template. Please try again."
            };

            try
            {
                // Query existing template by ID, tenant, and user to ensure ownership
                var existingTemplate = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w =>
                        w.Id == projectTemplateDto.Id &&
                        w.TenantId == _tenantId &&
                        w.CreatedByUserId == _userId
                    )
                    .FirstOrDefaultAsync();

                // Handle not found case
                if (existingTemplate == null)
                {
                    _logger.LogWarning("Project template with ID {ProjectTemplateId} not found for update.", projectTemplateDto.Id);
                    serviceResponse.Message = "Project template not found.";
                    return serviceResponse;
                }

                // Trim string properties for data consistency
                projectTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(projectTemplateDto);

                // Map updated values onto existing entity and increment version
                existingTemplate = projectTemplateDto.Adapt(existingTemplate);
                existingTemplate.Version += 1;
                existingTemplate.LastModifiedByUserId = _userId;

                // Mark entity as updated
                _unitOfWork.ProjectTemplateRepo.Update(existingTemplate);

                // Save changes and check success
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("SaveChanges failed when updating project template with ID {ProjectTemplateId}.", projectTemplateDto.Id);
                    return serviceResponse;
                }

                // Map updated entity to DTO and set success response
                serviceResponse.Data = existingTemplate.Adapt<ProjectTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project template updated successfully.";

                // Log success
                _logger.LogInformation("Successfully updated project template with ID {ProjectTemplateId} by user {UserId}.",
                    projectTemplateDto.Id, _userId);
            }
            catch (Exception ex)
            {
                // Log exceptions
                _logger.LogError(ex, "An error occurred while updating project template with ID {ProjectTemplateId}.", projectTemplateDto.Id);
                serviceResponse.Message = "An unexpected error occurred while updating the project template.";
            }

            return serviceResponse;
        }

        // Deletes an existing project template by its ID.
        public async Task<ServiceResponse<bool>> DeleteProjectTemplateAsync(Guid projectTemplateId)
        {
            // Initialize default response with failure message
            var serviceResponse = new ServiceResponse<bool>
            {
                Data = false,
                Message = "Failed to delete template. Please try again."
            };

            try
            {
                // Query for existing template by ID, tenant, user, including related resources
                var existingTemplate = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w =>
                        w.Id == projectTemplateId &&
                        w.TenantId == _tenantId &&
                        w.CreatedByUserId == _userId
                    )
                    .Include(i => i.TemplateResources)
                    .FirstOrDefaultAsync();

                // Handle not found case
                if (existingTemplate == null)
                {
                    _logger.LogWarning("Project template with ID {ProjectTemplateId} not found for deletion.", projectTemplateId);
                    serviceResponse.Message = "Project template not found.";
                    return serviceResponse;
                }

                // Delete the template entity
                _unitOfWork.ProjectTemplateRepo.Delete(existingTemplate);

                // Save changes and check success
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("SaveChanges failed when deleting project template with ID {ProjectTemplateId}.", projectTemplateId);
                    return serviceResponse;
                }

                // Set success response
                serviceResponse.Data = true;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project template deleted successfully.";

                // Log success
                _logger.LogInformation("Successfully deleted project template with ID {ProjectTemplateId} by user {UserId}.",
                    projectTemplateId, _userId);
            }
            catch (Exception ex)
            {
                // Log exceptions
                _logger.LogError(ex, "An error occurred while deleting project template with ID {ProjectTemplateId}.", projectTemplateId);
                serviceResponse.Message = "An unexpected error occurred while deleting the project template.";
            }

            return serviceResponse;
        }

        // Deletes multiple existing project templates by their IDs.
        public async Task<ServiceResponse<bool>> DeleteProjectTemplatesAsync(IEnumerable<Guid> projectTemplateIds)
        {
            // Initialize default response with failure message
            var serviceResponse = new ServiceResponse<bool>
            {
                Data = false,
                Message = "Failed to delete templates. Please try again."
            };

            try
            {
                // Fetch all templates matching the IDs, tenant, and user including related resources
                var templatesToDelete = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w =>
                        projectTemplateIds.Contains(w.Id) &&
                        w.TenantId == _tenantId &&
                        w.CreatedByUserId == _userId
                    )
                    .Include(i => i.TemplateResources)
                    .ToListAsync();

                // If no templates found to delete, return not found message
                if (templatesToDelete == null || !templatesToDelete.Any())
                {
                    _logger.LogWarning("No project templates found for deletion with provided IDs.");
                    serviceResponse.Message = "No project templates found for deletion.";
                    return serviceResponse;
                }

                // Delete all identified project templates
                _unitOfWork.ProjectTemplateRepo.Delete(templatesToDelete);

                // Save changes and check success
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogInformation("SaveChanges failed when deleting multiple project templates.");
                    return serviceResponse;
                }

                // Set success response
                serviceResponse.Data = true;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = $"Successfully deleted {templatesToDelete.Count} project templates.";

                // Log success with count and user context
                _logger.LogInformation("Successfully deleted {Count} project templates by user {UserId}.",
                    templatesToDelete.Count, _userId);
            }
            catch (Exception ex)
            {
                // Log exceptions
                _logger.LogError(ex, "An error occurred while deleting multiple project templates.");
                serviceResponse.Message = "An unexpected error occurred while deleting the project templates.";
            }

            return serviceResponse;
        }

        // Publishes a project template based on the specified type (Agent, Block, Inferencing, Conversation, and Generative).
        public async Task<ServiceResponse<ProjectTemplateDto>> PublishProjectTemplateAsync(PublishProjectTemplateDto publishProjectTemplateDto)
        {
            var serviceResponse = new ServiceResponse<ProjectTemplateDto>
            {
                Data = null,
                Message = "Failed to publish the template. Please try again."
            };

            try
            {
                // Validate required fields based on access type
                if (publishProjectTemplateDto.AccessType == TemplateAccessTypesEnum.Space
                    && (publishProjectTemplateDto.SpaceIds == null || !publishProjectTemplateDto.SpaceIds.Any()))
                {
                    _logger.LogWarning("PublishTemplateAsync: 'AccessType' is set to 'Space' but no SpaceIds were provided.");
                    serviceResponse.Message = "When 'AccessType' is set to 'Space', at least one SpaceId must be specified.";
                    return serviceResponse;
                }

                // Trim string properties for data consistency
                publishProjectTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(publishProjectTemplateDto);

                ProjectTemplate? projectTemplate = null;

                if (publishProjectTemplateDto.Type == ProjectTemplateTypesEnum.Block || publishProjectTemplateDto.Type == ProjectTemplateTypesEnum.Agent)
                {
                    // Fetch the flow version using RefId
                    var flowVersion = await _unitOfWork.FlowVersionRepo
                        .GetByConditionAsync(w => w.Id == publishProjectTemplateDto.RefId)
                        .Include(i => i.Flow)
                        .SingleOrDefaultAsync();

                    // Check if the flow version exists
                    if (flowVersion == null)
                    {
                        _logger.LogInformation("PublishTemplateAsync: No flow version found for RefId: {RefId}.", publishProjectTemplateDto.RefId);
                        serviceResponse.Message = "Specified flow version does not exist.";
                        return serviceResponse;
                    }

                    // Map DTO to entity and set properties from flow version
                    projectTemplate = publishProjectTemplateDto.Adapt<ProjectTemplate>();
                    projectTemplate.TenantId = _tenantId;
                    projectTemplate.Version = 1;
                    projectTemplate.RefId = flowVersion.Id;
                    projectTemplate.Schema = flowVersion.ReactFlowObject;
                    projectTemplate.SchemaVersion = flowVersion.VersionNumber;
                    projectTemplate.CreatedByUserId = _userId;
                    projectTemplate.LastModifiedByUserId = _userId;
                }
                else
                {
                    // TODO: Update for ml model type like Inferencing, Conversation, and Generative
                    // Fetch the ml model version using RefId
                    var flowVersion = await _unitOfWork.FlowVersionRepo
                        .GetByConditionAsync(w => w.Id == publishProjectTemplateDto.RefId)
                        .Include(i => i.Flow)
                        .SingleOrDefaultAsync();

                    // Check if the flow version exists
                    if (flowVersion == null)
                    {
                        _logger.LogInformation("PublishTemplateAsync: No ml model version found for RefId: {RefId}.", publishProjectTemplateDto.RefId);
                        serviceResponse.Message = "Specified ml model version does not exist.";
                        return serviceResponse;
                    }

                    // Map DTO to entity and set properties from flow version
                    projectTemplate = publishProjectTemplateDto.Adapt<ProjectTemplate>();
                    projectTemplate.TenantId = _tenantId;
                    projectTemplate.Version = 1;
                    projectTemplate.RefId = flowVersion.Id;
                    projectTemplate.Schema = flowVersion.ReactFlowObject;
                    projectTemplate.SchemaVersion = flowVersion.VersionNumber;
                    projectTemplate.CreatedByUserId = _userId;
                    projectTemplate.LastModifiedByUserId = _userId;
                }

                // Insert the new template entity into repository
                await _unitOfWork.ProjectTemplateRepo.InsertAsync(projectTemplate);

                // Save changes, if fails return failure response
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("PublishTemplateAsync: Failed to persist project template to the database.");
                    return serviceResponse;
                }

                // Check if any file resources are provided in the request
                if (publishProjectTemplateDto.Resources != null)
                {
                    // Map each file resource DTO to a TemplateResource entity
                    var templateResources = publishProjectTemplateDto.Resources.Select(s => new TemplateResource()
                    {
                        Name = s.Name,
                        Size = s.Size,
                        Path = s.Path,
                        Extension = s.Extension ?? string.Empty,
                        IsLocal = true,
                        ProjectTemplateId = projectTemplate.Id,
                        TenantId = _tenantId,
                        CreatedByUserId = _userId,
                        LastModifiedByUserId = _userId
                    }).ToList();

                    // Insert the new template resource entities into the repository
                    await _unitOfWork.TemplateResourceRepo.InsertAsync(templateResources);

                    // Attempt to save changes to the database; return failure response if save fails
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogWarning("PublishTemplateAsync: Failed to persist template resource to the database.");
                        return serviceResponse;
                    }
                }
                // On success, adapt to DTO and set response
                serviceResponse.Data = projectTemplate.Adapt<ProjectTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Template published successfully.";

                _logger.LogInformation("PublishTemplateAsync: Successfully published template with RefId {RefId} by user {UserId}.",
                    publishProjectTemplateDto.RefId, _userId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PublishTemplateAsync: An unexpected error occurred.");
            }

            return serviceResponse;
        }

        // Searches project templates by name.
        public async Task<ServiceResponse<IEnumerable<SearchProjectTemplateDto>>> SearchProjectTemplatesAsync(string searchKey)
        {
            // Initialize ServiceResponse to indicate failure by default.
            var serviceResponse = new ServiceResponse<IEnumerable<SearchProjectTemplateDto>>
            {
                Data = null,
                Message = "Failed to search project templates. Please try again."
            };

            try
            {
                // Attempt to retrieve the project templates that match the search key (case-insensitive).
                var projectTemplates = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w =>
                        w.Name.ToLower().Contains(searchKey.ToLower()) &&
                        (
                            w.AccessType == TemplateAccessTypesEnum.Public ||
                            (w.AccessType == TemplateAccessTypesEnum.TenantLevel && w.TenantId != null && w.TenantId == _tenantId) ||
                            (w.AccessType == TemplateAccessTypesEnum.Space && w.SpaceId != null && w.SpaceId == _spaceId)
                        )
                    )
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .AsNoTracking()
                    .ProjectToType<SearchProjectTemplateDto>()
                    .ToListAsync();

                // If found, populate the response with the result.
                serviceResponse.Data = projectTemplates;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project templates retrieved successfully.";

                // Log successful search
                _logger.LogInformation("SearchProjectTemplatesAsync: Retrieved {Count} project templates matching search key '{SearchKey}' for user {UserId}.",
                    projectTemplates.Count, searchKey, _userId);
            }
            catch (Exception ex)
            {
                // Log any exception that occurs.
                _logger.LogError(ex, "SearchProjectTemplatesAsync: An error occurred while searching project templates with key '{SearchKey}' for user {UserId}.",
                    searchKey, _userId);
            }

            // Return the final service response.
            return serviceResponse;
        }

        // Retrieves a list of trending project templates based on usage count.
        public async Task<ServiceResponse<IEnumerable<TrendingTemplateDto>>> GetAllTrendingProjectTemplatesAsync()
        {
            // Initialize a default failure response
            var serviceResponse = new ServiceResponse<IEnumerable<TrendingTemplateDto>>
            {
                Data = null,
                Message = "Failed to retrieve trending templates. Please try again later."
            };

            try
            {
                // Retrieve project templates accessible to the current tenant or publicly available
                // Results are ordered by descending usage count (i.e., most used/trending first)
                var trendingTemplates = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w =>
                        w.AccessType == TemplateAccessTypesEnum.Public ||
                        (w.AccessType == TemplateAccessTypesEnum.TenantLevel && w.TenantId != null && w.TenantId == _tenantId) ||
                        (w.AccessType == TemplateAccessTypesEnum.Space && w.SpaceId != null && w.SpaceId == _spaceId)
                    )
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .OrderByDescending(o => o.UsageCount)
                    .ToListAsync();

                // Populate response with retrieved data
                serviceResponse.Data = trendingTemplates.Adapt<IEnumerable<TrendingTemplateDto>>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Trending project templates retrieved successfully.";

                // Log successful retrieval
                _logger.LogInformation("Successfully retrieved {Count} trending project templates.", trendingTemplates.Count);
            }
            catch (Exception ex)
            {
                // Log any errors encountered during retrieval
                _logger.LogError(ex, "An error occurred while retrieving trending project templates.");
            }

            return serviceResponse;
        }

        // Uses the selected project template to create a new Agent flow or AI model configuration, based on the template type.
        public async Task<ServiceResponse<ProjectTemplateDto>> UseProjectTemplateAsync(TrendingTemplateDto trendingTemplateDto)
        {
            // Initialize the response with a default failure message
            var serviceResponse = new ServiceResponse<ProjectTemplateDto>
            {
                Message = "Failed to use the template. Please try again."
            };

            try
            {
                // Fetch the full project template including its resources
                var projectTemplate = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w => w.Id == trendingTemplateDto.Id)
                    .Include(i => i.TemplateResources)
                    .SingleOrDefaultAsync();

                // Return early if not found
                if (projectTemplate == null)
                {
                    _logger.LogWarning("Project template with ID: {TemplateId} not found.", trendingTemplateDto.Id);
                    serviceResponse.Message = "Project template not found.";
                    return serviceResponse;
                }

                var projectTemplateDto = projectTemplate.Adapt<ProjectTemplateDto>();

                _logger.LogInformation("Project template found. Template ID: {TemplateId}", trendingTemplateDto.Id);

                // Trim string properties in DTO to clean up any extra whitespace
                trendingTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(trendingTemplateDto);

                // Handle only Agent or Block template types (for flow creation)
                if (projectTemplate.Type == ProjectTemplateTypesEnum.Agent || projectTemplate.Type == ProjectTemplateTypesEnum.Block)
                {
                    // Map project template to new Flow entity
                    var flowEntity = new Flow
                    {
                        Name = $"{projectTemplate.Name} #{projectTemplate.UsageCount + 1}",
                        Description = projectTemplate.Description,
                        Type = Enum.Parse<FlowTypesEnum>(projectTemplate.Type.ToString(), true),
                        CreatedByUserId = _userId,
                        LastModifiedByUserId = _userId,
                        TenantId = _tenantId
                    };

                    // Insert new flow
                    await _unitOfWork.FlowRepo.InsertAsync(flowEntity);
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("Failed to save new flow for template ID: {TemplateId}.", trendingTemplateDto.Id);
                        return serviceResponse;
                    }

                    _logger.LogInformation("New flow saved successfully. Flow ID: {FlowId}", flowEntity.Id);

                    // Create corresponding FlowVersion
                    var newFlowVersion = new FlowVersion
                    {
                        FlowId = flowEntity.Id,
                        ReactFlowObject = projectTemplate.Schema,
                        VersionNumber = 1,
                        CreatedByUserId = _userId,
                        LastModifiedByUserId = _userId,
                        TenantId = _tenantId
                    };

                    await _unitOfWork.FlowVersionRepo.InsertAsync(newFlowVersion);
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogError("Failed to save flow version for Flow ID: {FlowId}.", flowEntity.Id);
                        return serviceResponse;
                    }

                    // Update refId as flowId
                    projectTemplateDto.RefId = flowEntity.Id;

                    _logger.LogInformation("Flow version saved successfully. Flow ID: {FlowId}, Version: 1", flowEntity.Id);
                }
                else
                {
                    // TODO: Update for ml model type like Inferencing, Conversation, and Generative
                    _logger.LogInformation("Template type '{Type}' is not supported for flow creation.", projectTemplate.Type);
                    serviceResponse.Message = $"Template type '{projectTemplate.Type}' is not supported for creating flows.";
                    return serviceResponse;
                }

                // Increment usage count and update the template
                projectTemplate.UsageCount++;
                _unitOfWork.ProjectTemplateRepo.Update(projectTemplate);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to update usage count for project template ID: {TemplateId}.", projectTemplate.Id);
                    return serviceResponse;
                }

                _logger.LogInformation("Flow or Mdoel successfully created from project template. Template ID: {TemplateId}", trendingTemplateDto.Id);

                // Return success response
                serviceResponse.Data = projectTemplateDto;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project template applied successfully.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while creating flow from project template ID: {TemplateId}.", trendingTemplateDto.Id);
            }

            return serviceResponse;
        }
    }
}
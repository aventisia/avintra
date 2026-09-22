namespace WorkspaceAPIs.Services
{
    public class ProjectTemplateService : IProjectTemplateService
    {
        private readonly ILogger<ProjectTemplateService> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAutoNotificationService _autoNotificationService;
        private readonly IUserManagementGuardService _userManagementGuardService;
        private readonly ILLMDataExtractionService _llmDataExtractionService;
        private readonly EnvironmentConfig _environmentConfig;
        private readonly Guid _userId;
        private readonly Guid _tenantId;
        private readonly Guid _spaceId;
        private readonly string _jwt;

        public ProjectTemplateService(
            ILogger<ProjectTemplateService> logger,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor httpContextAccessor,
            ICurrentTenantService currentTenantService,
            IAutoNotificationService autoNotificationService,
            IUserManagementGuardService userManagementGuardService,
            ILLMDataExtractionService llmDataExtractionService,
            EnvironmentConfig environmentConfig)
        {
            // Set _userId
            _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
            _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
            // Resolve space from CurrentTenantService (X-Space-Id header > spid claim > Guid.Empty/Central)
            // instead of reading the spid claim directly, so frontend header-only callers are scoped correctly.
            _spaceId = currentTenantService.CurrentSpaceId;

            _jwt = httpContextAccessor.HttpContext?.Request.Cookies["AccessToken"] ?? httpContextAccessor.HttpContext?.Request.Headers["Authorization"].ToString().Replace("Bearer ", "") ?? "";
            _logger = logger;
            _unitOfWork = unitOfWork;
            _autoNotificationService = autoNotificationService;
            _userManagementGuardService = userManagementGuardService;
            _llmDataExtractionService = llmDataExtractionService;
            _environmentConfig = environmentConfig;
        }

        // Retrieve all project templates list
        public async Task<ServiceResponse<IEnumerable<ProjectTemplateDto>>> GetAllProjectTemplatesAsync(ProjectTemplateTypesEnum? type)
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
                        w.Status == ProjectTemplateStatusesEnum.Approved &&
                        (!type.HasValue || w.Type == type.Value)
                    )
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .Include(i => i.TemplateResources)
                    .AsNoTracking()
                    .OrderByDescending(o => o.UsageCount)
                    .ToListAsync();

                // Map entities to DTOs and set success response
                serviceResponse.Data = projectTemplates.Adapt<IEnumerable<ProjectTemplateDto>>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project templates retrieved successfully.";
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
                    .Include(i => i.LastModifiedByUser)
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
                    .Include(i => i.LastModifiedByUser)
                    .Include(i => i.TemplateResources)
                    .FirstOrDefaultAsync();

                serviceResponse.Data = projectTemplate.Adapt<ProjectTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project template retrieved successfully.";
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
                    return serviceResponse;
                }

                // Map saved entity back to DTO and set success response
                serviceResponse.Data = newProjectTemplate.Adapt<ProjectTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project template inserted successfully.";
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
                        w.CreatedByUserId == _userId
                    )
                    .AsNoTracking()
                    .Include(i => i.TemplateResources)
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
                projectTemplateDto.Adapt(existingTemplate);
                existingTemplate.SchemaVersion += 1;
                existingTemplate.TenantId = projectTemplateDto.AccessType != TemplateAccessTypesEnum.Public ? _tenantId : null;
                existingTemplate.Status = ProjectTemplateStatusesEnum.Pending;
                existingTemplate.LastModifiedByUserId = _userId;
                existingTemplate.LastModifiedOn = DateTimeOffset.UtcNow;

                // Mark entity as updated
                _unitOfWork.ProjectTemplateRepo.Update(existingTemplate);

                // Save changes and check success
                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }

                // Check if resources were provided in the request
                if (projectTemplateDto.Resources != null)
                {
                    // Get the current resources from the database
                    var existingResources = existingTemplate.TemplateResources?.ToList() ?? new List<TemplateResource>();

                    // Initialize lists for resources to add, update, and remove
                    var resourcesToAdd = new List<TemplateResource>();
                    var resourcesToUpdate = new List<TemplateResource>();
                    var resourcesToRemove = new List<TemplateResource>();

                    // If resources are provided in the request, handle the changes
                    if (projectTemplateDto.Resources != null)
                    {
                        // Resources to remove: those that exist in DB but not in the request
                        resourcesToRemove = existingResources
                            .Where(w => !projectTemplateDto.Resources.Any(a => a.Id == w.Id))
                            .ToList();

                        // Resources to add: those that exist in the request but not in the DB
                        resourcesToAdd = projectTemplateDto.Resources
                            .Where(w => !existingResources.Any(a => a.Id == w.Id && a.Name == w.Name))
                            .Select(s => new TemplateResource
                            {
                                Name = s.Name,
                                Size = s.Size,
                                Path = s.Path,
                                Extension = s.Extension ?? string.Empty,
                                TenantId = existingTemplate.AccessType != TemplateAccessTypesEnum.Public ? _tenantId : null,
                                ProjectTemplateId = existingTemplate.Id,
                                CreatedByUserId = _userId,
                                LastModifiedByUserId = _userId
                            })
                            .ToList();

                        // Resources to update: those that exist in both the DB and the request (matching Id)
                        resourcesToUpdate = existingResources
                            .Where(w => projectTemplateDto.Resources.Any(a => a.Id == w.Id && a.Name != w.Name))
                            .ToList();

                        // Update fields for resources that exist both in the database and request
                        foreach (var resourceToUpdate in resourcesToUpdate)
                        {
                            var updatedResource = projectTemplateDto.Resources.FirstOrDefault(f => f.Id == resourceToUpdate.Id);
                            if (updatedResource != null)
                            {
                                // Update the resource fields (not creating new resources, just modifying the existing ones)
                                resourceToUpdate.Name = updatedResource.Name;
                                resourceToUpdate.Size = updatedResource.Size;
                                resourceToUpdate.Path = updatedResource.Path;
                                resourceToUpdate.Extension = updatedResource.Extension ?? string.Empty;
                                resourceToUpdate.LastModifiedByUserId = _userId;
                            }
                        }
                    }
                    else
                    {
                        // If Resources is null, delete all existing resources for this project template
                        resourcesToRemove = existingResources;
                    }

                    // Apply the changes: Insert new resources, Update existing resources, Delete old resources
                    if (resourcesToAdd.Any())
                    {
                        await _unitOfWork.TemplateResourceRepo.InsertAsync(resourcesToAdd);
                        // Save changes after inserting resources
                        if (!await _unitOfWork.SaveAsync())
                        {
                            _logger.LogError("SaveChanges failed when inserting resources for project template with ID {ProjectTemplateId}.", existingTemplate.Id);
                        }
                    }

                    if (resourcesToRemove.Any())
                    {
                        _unitOfWork.TemplateResourceRepo.Delete(resourcesToRemove);
                        // Save changes after deleting resources
                        if (!await _unitOfWork.SaveAsync())
                        {
                            _logger.LogError("SaveChanges failed when deleting resources for project template with ID {ProjectTemplateId}.", existingTemplate.Id);
                        }
                    }

                    if (resourcesToUpdate.Any())
                    {
                        _unitOfWork.TemplateResourceRepo.Update(resourcesToUpdate);
                        // Save changes after updating resources
                        if (!await _unitOfWork.SaveAsync())
                        {
                            _logger.LogError("SaveChanges failed when updating resources for project template with ID {ProjectTemplateId}.", existingTemplate.Id);
                        }
                    }
                }
                // Map updated entity to DTO and set success response
                serviceResponse.Data = existingTemplate.Adapt<ProjectTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project template updated successfully.";
            }
            catch (Exception ex)
            {
                // Log exceptions
                _logger.LogError(ex, "An error occurred while updating project template with ID {ProjectTemplateId}.", projectTemplateDto.Id);
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
                        w.Id == projectTemplateId
                    )
                    .Include(i => i.TemplateResources)
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                // Handle not found case
                if (existingTemplate == null)
                {
                    _logger.LogWarning("Project template with ID {ProjectTemplateId} not found for deletion.", projectTemplateId);
                    serviceResponse.Message = "Project template not found.";
                    return serviceResponse;
                }

                // Check if the user is allowed to delete the template
                if ((existingTemplate.CreatedByUserId == _userId && existingTemplate.Status != ProjectTemplateStatusesEnum.Approved) ||
                    (existingTemplate.Status == ProjectTemplateStatusesEnum.Approved && existingTemplate.AccessType == TemplateAccessTypesEnum.TenantLevel && _userManagementGuardService.HasRole("TA")) ||
                    (existingTemplate.Status == ProjectTemplateStatusesEnum.Approved && _userManagementGuardService.HasRole("SA")))
                {
                    // Delete the template entity
                    _unitOfWork.ProjectTemplateRepo.Delete(existingTemplate);

                    // Save changes and check success
                    if (!await _unitOfWork.SaveAsync())
                    {
                        return serviceResponse;
                    }
                }
                else
                {
                    // If none of the conditions match, return an error message
                    _logger.LogWarning("User does not have permission to delete project template with ID {ProjectTemplateId}.", projectTemplateId);
                    serviceResponse.Message = "You do not have permission to delete this project template.";
                }

                // Set success response
                serviceResponse.Data = true;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project template deleted successfully.";
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

                // Check if any template meets the deletion conditions
                var templatesToActuallyDelete = templatesToDelete
                    .Where(template =>
                        (template.CreatedByUserId == _userId && template.Status != ProjectTemplateStatusesEnum.Approved) ||
                        (template.Status != ProjectTemplateStatusesEnum.Approved && template.AccessType == TemplateAccessTypesEnum.TenantLevel && _userManagementGuardService.HasRole("TA")) ||
                        (template.Status != ProjectTemplateStatusesEnum.Approved && _userManagementGuardService.HasRole("SA"))
                    )
                    .ToList();

                // If no templates are eligible for deletion, return error message
                if (!templatesToActuallyDelete.Any())
                {
                    _logger.LogWarning("User does not have permission to delete any of the provided project templates.");
                    serviceResponse.Message = "You do not have permission to delete any of the provided project templates.";
                    return serviceResponse;
                }

                // Delete all identified project templates
                _unitOfWork.ProjectTemplateRepo.Delete(templatesToDelete);

                // Save changes and check success
                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }

                // Set success response
                serviceResponse.Data = true;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = $"Successfully deleted {templatesToDelete.Count} project templates.";
            }
            catch (Exception ex)
            {
                // Log exceptions
                _logger.LogError(ex, "An error occurred while deleting multiple project templates.");
                serviceResponse.Message = "An unexpected error occurred while deleting the project templates.";
            }

            return serviceResponse;
        }

        // Retrieves tenant project templates that are pending approval
        public async Task<ServiceResponse<IEnumerable<ProjectTemplateDto>>> GetTenantPendingApprovalProjectTemplatesAsync()
        {
            // Initialize default response with failure message
            var serviceResponse = new ServiceResponse<IEnumerable<ProjectTemplateDto>>
            {
                Data = null,
                Message = "Failed to retrieve templates pending approval. Please try again later."
            };

            try
            {
                // Build query to fetch project templates with status "Pending"
                var query = _unitOfWork.ProjectTemplateRepo.GetByConditionAsync(w =>
                        w.TenantId == _tenantId &&
                        w.Status == ProjectTemplateStatusesEnum.Pending
                    );

                // Execute the query: order by creation date (most recent first), and include related data
                var pendingApprovalTemplates = await query
                    .OrderByDescending(o => o.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .Include(i => i.TemplateResources)
                    .ToListAsync();

                // Map entities to DTOs and set success response
                serviceResponse.Data = pendingApprovalTemplates.Adapt<IEnumerable<ProjectTemplateDto>>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project templates pending approval retrieved successfully.";
            }
            catch (Exception ex)
            {
                // Log any errors during retrieval
                _logger.LogError(ex, "Error occurred while fetching pending approval templates for user {UserId} in tenant {TenantId}.", _userId, _tenantId);
            }

            return serviceResponse;
        }

        // Retrieves public project templates that are pending approval
        public async Task<ServiceResponse<IEnumerable<ProjectTemplateDto>>> GetPublicPendingApprovalProjectTemplatesAsync()
        {
            // Initialize default response with failure message
            var serviceResponse = new ServiceResponse<IEnumerable<ProjectTemplateDto>>
            {
                Data = null,
                Message = "Failed to retrieve templates pending approval. Please try again later."
            };

            try
            {
                // Build query to fetch project templates with status "Pending"
                var query = _unitOfWork.ProjectTemplateRepo.GetByConditionAsync(w =>
                        w.TenantId == null &&
                        w.Status == ProjectTemplateStatusesEnum.Pending
                    );

                // Execute the query: order by creation date (most recent first), and include related data
                var pendingApprovalTemplates = await query
                    .OrderByDescending(o => o.CreatedOn)
                    .Include(i => i.CreatedByUser)
                    .Include(i => i.LastModifiedByUser)
                    .Include(i => i.TemplateResources)
                    .ToListAsync();

                // Map entities to DTOs and set success response
                serviceResponse.Data = pendingApprovalTemplates.Adapt<IEnumerable<ProjectTemplateDto>>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project templates pending approval retrieved successfully.";
            }
            catch (Exception ex)
            {
                // Log any errors during retrieval
                _logger.LogError(ex, "Error occurred while fetching pending approval templates for user {UserId} in tenant {TenantId}.", _userId, _tenantId);
            }

            return serviceResponse;
        }

        // Updates the status of an existing project template (Approve/Reject)
        public async Task<ServiceResponse<ProjectTemplateDto>> UpdateTemplateStatusAsync(ProjectTemplateDto projectTemplateDto)
        {
            // Initialize default response with failure message
            var serviceResponse = new ServiceResponse<ProjectTemplateDto>
            {
                Data = null,
                Message = "Failed to update template status. Please try again."
            };

            try
            {
                // Query existing template by ID, tenant, and user to ensure ownership
                var existingTemplate = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w =>
                        w.Id == projectTemplateDto.Id
                    )
                    .AsNoTracking()
                    .FirstOrDefaultAsync();

                // Handle not found case
                if (existingTemplate == null)
                {
                    _logger.LogWarning("Project template with ID {ProjectTemplateId} not found for status update.", projectTemplateDto.Id);
                    serviceResponse.Message = "Project template not found.";
                    return serviceResponse;
                }

                // Update status and remark (if provided)
                existingTemplate.Status = projectTemplateDto.Status;
                existingTemplate.Remark = projectTemplateDto.Remark;
                existingTemplate.LastModifiedByUserId = _userId;
                existingTemplate.LastModifiedOn = DateTimeOffset.UtcNow;

                // Mark the template as updated
                _unitOfWork.ProjectTemplateRepo.Update(existingTemplate);

                // Save changes and check success
                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }

                // Determine the notification type and message based on the status
                string notificationMessage;

                // Set the notification message according to the project template's status
                switch (projectTemplateDto.Status)
                {
                    case ProjectTemplateStatusesEnum.Approved:
                        notificationMessage = $"Project template '{projectTemplateDto.Name}' has been approved.";
                        break;

                    case ProjectTemplateStatusesEnum.Rejected:
                        notificationMessage = $"Project template '{projectTemplateDto.Name}' was rejected. {projectTemplateDto.Remark ?? string.Empty}";
                        break;

                    default:
                        notificationMessage = $"Project template '{projectTemplateDto.Name}' status updated. {projectTemplateDto.Remark ?? string.Empty}";
                        break;
                }

                // TODO: Remove this check once the Space feature is implemented
                // Determine if the current user has the "SA" (Super Admin) role (case-insensitive)
                bool isSuperAdmin = _userManagementGuardService
                    .GetAllowedRoleListToManageUser()
                    .Any(role => string.Equals(role, "SA", StringComparison.OrdinalIgnoreCase));

                if (!isSuperAdmin)
                {
                    // Create the AutoNotificationDto
                    var notification = new AutoNotificationDto
                    {
                        RefId = projectTemplateDto.Id,
                        Message = notificationMessage,
                        Type = NotificationTypesEnum.Information,
                        UserIdList = new List<Guid>
                    {
                        existingTemplate.CreatedByUserId
                    },
                        // TODO: Replace with actual front-end URL for viewing the project template
                        // ActionUrl = $"https://yourapp.com/project-template/{projectTemplateDto.Id}"
                    };

                    // Insert the notification into the AutoNotificationService
                    if (!await _autoNotificationService.InsertAutoNotificationAsync(notification))
                    {
                        _logger.LogError("Failed to insert notification for project template '{ProjectTemplateName}' (ID: {ProjectTemplateId}) with status '{Status}'.",
                            projectTemplateDto.Name,
                            projectTemplateDto.Id,
                            projectTemplateDto.Status);
                    }
                }
                // Map updated entity to DTO and set success response
                serviceResponse.Data = existingTemplate.Adapt<ProjectTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project template status updated successfully.";
            }
            catch (Exception ex)
            {
                // Log exceptions
                _logger.LogError(ex, "An error occurred while updating status for project template with ID {ProjectTemplateId}.", projectTemplateDto.Id);
            }

            return serviceResponse;
        }

        // Publishes a project template based on the specified type (Agent, ChatAgent, Block, Prompt).
        public async Task<ServiceResponse<ProjectTemplateDto>> PublishProjectTemplateAsync(PublishProjectTemplateDto publishProjectTemplateDto)
        {
            // Initialize default response with failure message
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

                // Query for a project template by reference ID, including related user and resources
                var existingProjectTemplate = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w => w.RefId == publishProjectTemplateDto.RefId && w.Type != ProjectTemplateTypesEnum.Prompt)
                    .FirstOrDefaultAsync();

                if (existingProjectTemplate != null)
                {
                    _logger.LogWarning(
                        "Project template with reference ID {RefId} and Type {Type} already exists and has been published.",
                        publishProjectTemplateDto.RefId,
                        existingProjectTemplate.Type);

                    serviceResponse.Message = "Project template has already been published.";
                    return serviceResponse;
                }

                // Trim string properties for data consistency
                publishProjectTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(publishProjectTemplateDto);

                List<ProjectTemplate>? projectTemplates = new List<ProjectTemplate>();

                // Initialize tags list with the DTO's type, then append any additional tags
                var projectTemplateTags = new List<string>() { publishProjectTemplateDto.Type.ToString() };
                projectTemplateTags.AddRange(publishProjectTemplateDto.Tags);

                // Map the DTO to the ProjectTemplate entity and set common properties
                var newProjectTemplate = publishProjectTemplateDto.Adapt<ProjectTemplate>();
                newProjectTemplate.TenantId = publishProjectTemplateDto.AccessType != TemplateAccessTypesEnum.Public ? _tenantId : null;
                newProjectTemplate.Version = 1;
                newProjectTemplate.Tags = projectTemplateTags;
                newProjectTemplate.CreatedByUserId = _userId;
                newProjectTemplate.LastModifiedByUserId = _userId;

                // Use switch statement instead of if-else
                switch (publishProjectTemplateDto.Type)
                {
                    case ProjectTemplateTypesEnum.Block:
                    case ProjectTemplateTypesEnum.Agent:
                    case ProjectTemplateTypesEnum.ChatAgent:
                        {
                            // Fetch the flow version using RefId
                            var flowVersion = await _unitOfWork.FlowVersionRepo
                                .GetByConditionAsync(w => w.Id == publishProjectTemplateDto.RefId)
                                .Include(i => i.Flow)
                                .SingleOrDefaultAsync();

                            if (flowVersion == null)
                            {
                                serviceResponse.Message = "Specified flow version does not exist.";
                                return serviceResponse;
                            }

                            // Extract distinct icons from the DTO, or initialize empty list
                            var projectTemplateIcons = publishProjectTemplateDto?.Icons?.Distinct().ToList() ?? new List<string>();

                            newProjectTemplate.RefId = flowVersion.Id;
                            newProjectTemplate.Icons = IconSorterUtil.SortByPriority(projectTemplateIcons);
                            newProjectTemplate.Schema = flowVersion.ReactFlowObject;
                            newProjectTemplate.SchemaVersion = flowVersion.VersionNumber;
                            newProjectTemplate.AccessPath = $"/agent?f={flowVersion.FlowId}&v={flowVersion.Id}";
                            break;
                        }

                    case ProjectTemplateTypesEnum.Prompt:
                        {
                            // Safely get distinct icons or initialize an empty list
                            var icons = (publishProjectTemplateDto.Icons ?? new List<string>()).Distinct().ToList();

                            newProjectTemplate.RefId = publishProjectTemplateDto.RefId;
                            newProjectTemplate.Schema = publishProjectTemplateDto.Schema;
                            newProjectTemplate.SchemaVersion = 1;
                            newProjectTemplate.Icons = IconSorterUtil.SortByPriority(icons);

                            // No specific access path for Prompt templates
                            newProjectTemplate.AccessPath = string.Empty;

                            break;
                        }
                    default:
                        _logger.LogWarning("PublishTemplateAsync: Unhandled ProjectTemplateType {Type}.", publishProjectTemplateDto.Type);
                        serviceResponse.Message = "Unsupported project template type.";
                        return serviceResponse;
                }

                // If the access type is 'Space', create a ProjectTemplate for each SpaceId
                if (newProjectTemplate.AccessType == TemplateAccessTypesEnum.Space)
                {
                    foreach (var spaceId in publishProjectTemplateDto.SpaceIds)
                    {
                        // Create a new instance for each SpaceId to avoid reference issues
                        var projectTemplateWithSpace = newProjectTemplate.Adapt<ProjectTemplate>();
                        projectTemplateWithSpace.SpaceId = spaceId;
                        projectTemplates.Add(projectTemplateWithSpace);
                    }
                }
                else
                {
                    projectTemplates.Add(newProjectTemplate);
                }

                // Check if projectTemplates is not null before proceeding with insertion
                if (projectTemplates != null)
                {
                    // Insert the new template entity into repository
                    await _unitOfWork.ProjectTemplateRepo.InsertAsync(projectTemplates);

                    // Save changes, if fails return failure response
                    if (!await _unitOfWork.SaveAsync())
                    {
                        _logger.LogWarning("PublishTemplateAsync: Failed to persist project template to the database.");
                        return serviceResponse;
                    }
                }

                // Check if any file resources are provided in the request
                if (publishProjectTemplateDto.Resources != null)
                {
                    // Create a list to hold all template resources
                    var allTemplateResources = new List<TemplateResource>();

                    // For each project template (this covers all templates, not just one)
                    foreach (var projectTemplate in projectTemplates)
                    {
                        // Map each file resource DTO to a TemplateResource entity associated with the current project template
                        var templateResources = publishProjectTemplateDto.Resources.Select(s => new TemplateResource()
                        {
                            Name = s.Name,
                            Size = s.Size,
                            Path = s.Path,
                            Extension = s.Extension ?? string.Empty,
                            TenantId = publishProjectTemplateDto.AccessType != TemplateAccessTypesEnum.Public ? _tenantId : null,
                            ProjectTemplateId = projectTemplate.Id,
                            CreatedByUserId = _userId,
                            LastModifiedByUserId = _userId
                        }).ToList();

                        // Add these resources to the allTemplateResources list
                        allTemplateResources.AddRange(templateResources);
                    }

                    // Insert all template resources in a single batch
                    await _unitOfWork.TemplateResourceRepo.InsertAsync(allTemplateResources);

                    // Attempt to save changes to the database
                    // If saving the changes fails, log a warning and return a failure response
                    if (!await _unitOfWork.SaveAsync())
                    {
                        // Log warning message for debugging
                        _logger.LogWarning("PublishTemplateAsync: Failed to persist template resources to the database.");

                        // Return failure service response, informing that the operation was unsuccessful
                        return serviceResponse;
                    }
                }

                // On success, adapt to DTO and set response
                serviceResponse.Data = projectTemplates?.FirstOrDefault().Adapt<ProjectTemplateDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Template published successfully.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "PublishTemplateAsync: An unexpected error occurred.");
            }

            return serviceResponse;
        }

        // Searches project templates by name.
        public async Task<ServiceResponse<IEnumerable<SearchProjectTemplateDto>>> SearchProjectTemplatesAsync(string searchKey, ProjectTemplateTypesEnum? type)
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
                        (!type.HasValue || w.Type == type.Value) &&
                        w.Status == ProjectTemplateStatusesEnum.Approved &&
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
                    .GetByConditionAsync(template =>
                        template.Status == ProjectTemplateStatusesEnum.Approved &&
                        (
                            template.AccessType == TemplateAccessTypesEnum.Public ||
                            (template.AccessType == TemplateAccessTypesEnum.TenantLevel && template.TenantId.HasValue && template.TenantId == _tenantId) ||
                            (template.AccessType == TemplateAccessTypesEnum.Space && template.SpaceId.HasValue && template.SpaceId == _spaceId)
                        )
                    )
                    .Include(t => t.CreatedByUser)
                    .Include(t => t.LastModifiedByUser)
                    .Include(t => t.TemplateResources)
                    .OrderByDescending(t => t.UsageCount)
                    .ToListAsync();

                // Populate response with retrieved data
                serviceResponse.Data = trendingTemplates.Adapt<IEnumerable<TrendingTemplateDto>>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Trending project templates retrieved successfully.";
            }
            catch (Exception ex)
            {
                // Log any errors encountered during retrieval
                _logger.LogError(ex, "An error occurred while retrieving trending project templates.");
            }

            return serviceResponse;
        }

        // Uses the selected project template to create a new Agent flow configuration, based on the template type.
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
                    .GetByConditionAsync(w =>
                        w.Id == trendingTemplateDto.Id &&
                        w.Status == ProjectTemplateStatusesEnum.Approved
                    )
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

                // Trim string properties in DTO to clean up any extra whitespace
                trendingTemplateDto = TrimDtoStringPropsUtil.TrimDtoStringProps(trendingTemplateDto);

                // Handle only Agent, Block, or ChatAgent template types (for flow creation)
                if (projectTemplate.Type == ProjectTemplateTypesEnum.Agent || projectTemplate.Type == ProjectTemplateTypesEnum.Block || projectTemplate.Type == ProjectTemplateTypesEnum.ChatAgent)
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

                    // Template schemas bypass normal initial graph creation, so normalize
                    // ChatAgent schemas to the single-node shape before persisting
                    var templateSchema = projectTemplate.Schema;
                    if (projectTemplate.Type == ProjectTemplateTypesEnum.ChatAgent)
                    {
                        templateSchema = ChatAgentGraphHelpers.NormalizeChatAgentSchema(
                            templateSchema,
                            WorkspaceAPIs.Features.FlowVersion.Utils.InitialNodesAndEdgesUtil.GetInitialNodesAndEdges(FlowTypesEnum.ChatAgent));
                    }

                    // Create corresponding FlowVersion
                    var newFlowVersion = new FlowVersion
                    {
                        FlowId = flowEntity.Id,
                        ReactFlowObject = templateSchema,
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
                    projectTemplateDto.AccessPath = $"/agent?f={flowEntity.Id}&v={newFlowVersion.Id}"; ;
                }

                // Increment usage count and update the template
                projectTemplate.UsageCount++;
                _unitOfWork.ProjectTemplateRepo.Update(projectTemplate);

                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to update usage count for project template ID: {TemplateId}.", projectTemplate.Id);
                    return serviceResponse;
                }

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

        // Generates a new project template using an LLM (Large Language Model) based on the provided template data.
        public async Task<ServiceResponse<string>> GenerateTemplateUsingLLMAsync(GenereateProjectInstructionRequestDto genereateProjectInstructionRequestDto)
        {
            // Initialize a default failure response
            var serviceResponse = new ServiceResponse<string>
            {
                Data = null,
                Message = "Failed to generate documentation. Please try again later."
            };

            // Check for credits availability
            var hasSufficientCredits = await _llmDataExtractionService.HasSufficientCreditsAsync();
            if (!hasSufficientCredits.Data)
            {
                serviceResponse.Message = "Unable to generate documentation due to insufficient credits.";
                return serviceResponse;
            }

            // Determine the prompt file name from the requested target, falling back to the
            // RefType-based template prompts.
            var promptFileName = genereateProjectInstructionRequestDto.PromptTarget switch
            {
                PromptGenerationTargetsEnum.ChatAgentSystemPrompt =>
                    string.IsNullOrWhiteSpace(genereateProjectInstructionRequestDto.Payload)
                        ? "GenerateChatAgentPromptInstructions.txt"
                        : "ImproveChatAgentPromptInstructions.txt",
                _ => genereateProjectInstructionRequestDto.RefType switch
                {
                    UsageSourceTypesEnum.Agent => "GenerateAgentTemplateDescriptionPrompt.txt",
                    UsageSourceTypesEnum.Platform => "ImprovedPromptInstructions.txt",
                    _ => "NA"
                }
            };

            // Build the full path to the prompt file using the current directory and subdirectories
            var file = new FileInfo(Path.Combine(
                Directory.GetCurrentDirectory(),
                "StaticFiles",
                "Prompts",
                promptFileName
            ));

            string promptTemplate;
            try
            {
                promptTemplate = await File.ReadAllTextAsync(file.FullName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to read LLM prompt template from {PromptFilePath}", file.FullName);
                serviceResponse.Message = "Failed to read prompt template. Please contact support.";
                return serviceResponse;
            }

            var prompt = promptTemplate.Replace(
                "{{PAYLOAD_CONTENT}}",
                genereateProjectInstructionRequestDto.Payload ?? string.Empty);
            var model = "gpt-4o-mini";
            var provider = "openai";
            // ChatAgent prompt work is more deterministic so intent and formatting hold.
            var temperature = genereateProjectInstructionRequestDto.PromptTarget
                == PromptGenerationTargetsEnum.ChatAgentSystemPrompt
                ? 0.4
                : 1;

            try
            {
                // Call the LLM service to generate the documentation
                // var generatedOutput = await _llmDataExtractionService.ExtractDataAsync(
                //     prompt: prompt,
                //     llmModel: model,
                //     modelTemperature: temperature,
                //     genereateProjectInstructionRequestDto.RefType,
                //     genereateProjectInstructionRequestDto.RefId,
                //     genereateProjectInstructionRequestDto.RefName,
                //     ActionTypesEnum.TemplateDescriptionGeneration,
                //     null, // This will never be triggered by an agent
                //     null, // No ollama output schema needed
                //     false // No json output required
                // );

                // Create a request object to send to the LLM service for data extraction
                var llmRequest = new LLMRequest()
                {
                    Model = model,
                    Input = prompt,
                    Provider = provider,
                    Temperature = temperature,
                    Stream = false,
                    RefType = genereateProjectInstructionRequestDto.RefType.ToString(),
                    RefId = genereateProjectInstructionRequestDto.RefId.ToString(),
                    RefName = genereateProjectInstructionRequestDto.RefName,
                    Action = ActionTypesEnum.TemplateDescriptionGeneration.ToString(),
                };

                // Call the service to extract data asynchronously, passing in the LLM request
                var generatedOutput = await _llmDataExtractionService.ExtractDataAsync(llmRequest);

                // Handle null or empty response
                if (generatedOutput.Data == null)
                {
                    serviceResponse.Message = "LLM response was empty. Please try again later.";
                    _logger.LogWarning("LLM returned null data while generating instructions/documentation. Check input payload or prompt.");
                }

                // Populate the successful response
                serviceResponse.Data = generatedOutput.Data;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Documentation and instructions generated successfully.";
            }
            catch (Exception ex)
            {
                // Log any exceptions that occur during the LLM call
                _logger.LogError(ex, "An error occurred while generating documentation using LLM model: {Model}", model);
            }

            return serviceResponse;
        }

        // Validates whether the specified projects are approved templates and checks access type.
        public async Task<ServiceResponse<List<ProjectAccessStatusDto>>> ValidateProjectAccessAsync(IEnumerable<ProjectAccessStatusDto> projectAccessStatusDtos)
        {
            // Initialize the service response with a default failure state.
            var serviceResponse = new ServiceResponse<List<ProjectAccessStatusDto>>
            {
                Data = null,
                Message = "Failed to validate project access. Please try again.",
            };

            try
            {
                // Extract all RefIds from the incoming project access DTOs to use for querying.
                var refIds = projectAccessStatusDtos.Select(p => p.RefId).ToList();

                // Early return if no refIds provided
                if (!refIds.Any())
                {
                    serviceResponse.Data = new List<ProjectAccessStatusDto>();
                    serviceResponse.StatusCode = 200;
                    serviceResponse.Message = "No project references provided.";
                    _logger.LogWarning("ValidateProjectAccessAsync: No project RefIds provided for validation.");
                    return serviceResponse;
                }

                // Retrieve matching project templates from repository
                var projectTemplates = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w => refIds.Contains(w.RefId))
                    .AsNoTracking()
                    .ToListAsync();

                // Create dictionary for O(1) lookup by RefId
                var templateDict = projectTemplates.ToDictionary(t => t.RefId);

                var validatedProjects = new List<ProjectAccessStatusDto>();

                foreach (var projectAccess in projectAccessStatusDtos)
                {
                    // Determine if project template exists and is approved
                    bool isApproved = templateDict.TryGetValue(projectAccess.RefId, out var matchedTemplate)
                                      && matchedTemplate.Status == ProjectTemplateStatusesEnum.Approved;

                    var validatedProject = matchedTemplate.Adapt<ProjectAccessStatusDto>() ?? new ProjectAccessStatusDto() { RefId = projectAccess.RefId, Name = projectAccess.Name };
                    validatedProject.IsApprovedTemplate = isApproved;
                    validatedProjects.Add(validatedProject);
                }

                serviceResponse.Data = validatedProjects;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project access validated successfully.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ValidateProjectAccessAsync: Error validating project access.");
            }

            return serviceResponse;
        }


        // Retrieve project templates for select-option dropdown
        public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetProjectTemplatesForSelectOptionsAsync(ProjectTemplateTypesEnum? type)
        {
            var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
            {
                Data = null,
                Message = "Failed to retrieve templates. Please try again later."
            };

            try
            {
                // Fetch project templates created by the user, optionally filtered by type
                var projectTemplates = await _unitOfWork.ProjectTemplateRepo
                    .GetByConditionAsync(w =>
                        w.Status == ProjectTemplateStatusesEnum.Approved &&
                        (w.AccessType == TemplateAccessTypesEnum.Public || w.AccessType == TemplateAccessTypesEnum.TenantLevel) &&
                        (!type.HasValue || w.Type == type.Value)
                    )
                    .AsNoTracking()
                    .OrderByDescending(o => o.UsageCount)
                    .ToListAsync();

                // Map to SelectOption (e.g., Id and Name for dropdown)
                serviceResponse.Data = projectTemplates
                    .Select(s => new SelectOption
                    {
                        Label = s.Name,
                        Description = s.Schema,
                        Value = s.Id.ToString(),
                    })
                    .ToList();

                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Project templates retrieved successfully.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while fetching select-option templates for user {UserId} in tenant {TenantId}.",
                    _userId, _tenantId);
            }

            return serviceResponse;
        }
    }
}
namespace MLModelBuilderAPIs.Services
{
    public class AIProjectService : IAIProjectService
    {
        private readonly ILogger<AIProjectService> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly Guid _userId;

        // Constructor that initializes the dependencies for the service.
        public AIProjectService(
            ILogger<AIProjectService> logger,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor httpContextAccessor)
        {
            // Extract current user ID from HTTP context claims (using claim type "uid").
            // If no "uid" claim exists, the _userId is initialized to Guid.Empty.
            _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

            // Initialize logger for logging purposes
            _logger = logger;
            
            // Initialize UnitOfWork for accessing repositories
            _unitOfWork = unitOfWork;
        }

        // Retrieves the list of AI projects either created by or shared with the current user.
        public async Task<ServiceResponse<IEnumerable<AIProjectDto>>> GetAIProjectListAsync()
        {
            var serviceResponse = new ServiceResponse<IEnumerable<AIProjectDto>>
            {
                Data = null,
                Message = "Failed to retrieve AI projects. Please try again."
            };

            try
            {
                // Log information regarding the fetching of AI projects for a particular user
                _logger.LogInformation("Fetching AI projects list for user: {UserId}", _userId);

                // Create a query to fetch AI projects that are either created by the user
                // or shared with the user through the ProjectUsers table.
                var aiProjectQuery = _unitOfWork.AIProjectRepo
                    .GetByConditionAsync(project =>
                        project.CreatedByUserId == _userId ||
                        (project.ProjectUsers != null && project.ProjectUsers.Any(pu => pu.UserId == _userId))
                    )
                    .AsNoTracking()
                    .OrderByDescending(project => project.CreatedOn)
                    .Include(project => project.CreatedByUser)
                    .Include(project => project.ProjectUsers)
                    .Include(project => project.Versions!)
                        .ThenInclude(version => version.Tasks);

                // Execute query and retrieve AI projects along with their related entities
                var aiProjectEntities = await aiProjectQuery.ToListAsync();

                // Log the count of projects fetched
                _logger.LogInformation("Fetched {ProjectCount} AI projects for user {UserId}", aiProjectEntities.Count, _userId);

                // Map the list of entity objects to DTO (Data Transfer Objects) to return to the client
                serviceResponse.Data = aiProjectEntities.Adapt<IEnumerable<AIProjectDto>>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "AI projects retrieved successfully.";
            }
            catch (Exception ex)
            {
                // Log the exception if any error occurs while fetching the AI projects
                _logger.LogError(ex, "Exception occurred while fetching AI projects for user: {UserId}", _userId);
            }

            return serviceResponse;
        }

        // Checks if a given AI project name is available for the current user (case-insensitive).
        public async Task<ServiceResponse<TrueFalseResultDto>> IsAIProjectNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
        {
            var serviceResponse = new ServiceResponse<TrueFalseResultDto>
            {
                Data = null,
                Message = "Failed to check AI project name availability. Please try again."
            };

            try
            {
                // Trim user input to avoid leading/trailing spaces
                string trimmedUserInput = checkAvailabilityDto.UserInput?.Trim() ?? string.Empty;

                // Log the input data and the user for availability check
                _logger.LogInformation("Checking AI project name availability for user {UserId}: '{ModelName}'", _userId, trimmedUserInput);

                // Check if there's any existing project with the same name created by the current user (case insensitive)
                var existingProject = await _unitOfWork.AIProjectRepo
                    .GetByConditionAsync(project =>
                        project.CreatedByUserId == _userId &&
                        project.Name.ToLower() == trimmedUserInput.ToLower())
                    .FirstOrDefaultAsync();

                // If project with the same name exists, respond with false
                if (existingProject != null)
                {
                    _logger.LogInformation("AI project name '{ModelName}' is already taken by user {UserId}", trimmedUserInput, _userId);
                    serviceResponse.Data = new TrueFalseResultDto { Result = false };
                    serviceResponse.StatusCode = 200;
                    serviceResponse.Message = "An AI project with the same name already exists. Please enter a unique name.";
                    return serviceResponse;
                }

                // If the name is available, respond with true
                _logger.LogInformation("AI project name '{ModelName}' is available for user {UserId}", trimmedUserInput, _userId);
                serviceResponse.Data = new TrueFalseResultDto { Result = true };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "AI project name is available.";
            }
            catch (Exception ex)
            {
                // Log any exception during availability check
                _logger.LogError(ex, "Exception occurred while checking AI project name availability for user {UserId}", _userId);
            }

            return serviceResponse;
        }

        // Creates a new AI project for the current user.
        public async Task<ServiceResponse<AIProjectDto>> InsertAIProjectAsync(AIProjectDto aiProjectDto)
        {
            var serviceResponse = new ServiceResponse<AIProjectDto>
            {
                Data = null,
                Message = "Failed to insert AI project. Please try again."
            };

            try
            {
                // Trim the project name and log the attempt to create a new project
                string trimmedProjectName = aiProjectDto.Name?.Trim() ?? string.Empty;
                _logger.LogInformation("Inserting new AI project for user {UserId} with project name '{ProjectName}'", _userId, trimmedProjectName);

                // Check if a project with the same name already exists for the current user
                var duplicateProject = await _unitOfWork.AIProjectRepo
                    .GetByConditionAsync(project =>
                        project.CreatedByUserId == _userId &&
                        project.Name.ToLower() == trimmedProjectName.ToLower())
                    .FirstOrDefaultAsync();

                // If a project with the same name exists, respond with conflict
                if (duplicateProject != null)
                {
                    _logger.LogInformation("AI project with name '{ProjectName}' already exists for user {UserId}", trimmedProjectName, _userId);
                    serviceResponse.StatusCode = 409; // Conflict
                    serviceResponse.Message = "An AI project with the same name already exists. Please enter a unique name.";
                    return serviceResponse;
                }

                // Clean up string properties of the DTO for consistency
                aiProjectDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiProjectDto);

                // Map the DTO to the entity model for insertion into the database
                var newAIProjectEntity = aiProjectDto.Adapt<AIProject>();

                // Set the user as the creator and modifier
                newAIProjectEntity.CreatedByUserId = _userId;
                newAIProjectEntity.LastModifiedByUserId = _userId;

                // Insert the new AI project entity into the repository
                await _unitOfWork.AIProjectRepo.InsertAsync(newAIProjectEntity);

                // Save the changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save new AI project to database for user {UserId}", _userId);
                    return serviceResponse;
                }

                _logger.LogInformation("New AI project created with ID {ProjectId} for user {UserId}", newAIProjectEntity.Id, _userId);

                // Create an initial version for the project
                var initialProjectVersion = new AIProjectVersion()
                {
                    BusinessContext = string.Empty,
                    VersionNumber = 1,
                    AIProjectId = newAIProjectEntity.Id,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                };

                // Insert the initial project version into the repository
                await _unitOfWork.AIProjectVersionRepo.InsertAsync(initialProjectVersion);

                // Save the changes for the version
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save initial version for AI project ID {ProjectId} for user {UserId}", newAIProjectEntity.Id, _userId);
                    return serviceResponse;
                }

                _logger.LogInformation("Initial AI project version created for project ID {ProjectId}", newAIProjectEntity.Id);

                // Map and return the newly created project as a DTO
                serviceResponse.Data = newAIProjectEntity.Adapt<AIProjectDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "AI project added successfully.";
            }
            catch (Exception ex)
            {
                // Log exception if something goes wrong during project insertion
                _logger.LogError(ex, "Exception occurred while inserting AI project for user {UserId}", _userId);
            }

            return serviceResponse;
        }

        // Updates an existing AI project with new data if the user has appropriate access rights.
        public async Task<ServiceResponse<AIProjectDto>> UpdateAIProjectAsync(AIProjectDto aiProjectDto)
        {
            var serviceResponse = new ServiceResponse<AIProjectDto>
            {
                Data = null,
                Message = "Failed to update AI project. Please try again."
            };

            try
            {
                _logger.LogInformation("Updating AI project ID {ProjectId} for user {UserId}", aiProjectDto.Id, _userId);

                // Retrieve the existing project and check if the user has permission to modify it
                var existingProjectEntity = await _unitOfWork.AIProjectRepo
                    .GetByConditionAsync(project =>
                        project.Id == aiProjectDto.Id &&
                        (
                            project.CreatedByUserId == _userId ||
                            (project.ProjectUsers != null && project.ProjectUsers.Any(pu => pu.UserId == _userId))
                        )
                    )
                    .Include(project => project.ProjectUsers)
                    .SingleOrDefaultAsync();

                // If the project doesn't exist or the user doesn't have access, return error
                if (existingProjectEntity == null)
                {
                    _logger.LogWarning("AI project ID {ProjectId} does not exist or user {UserId} has no access", aiProjectDto.Id, _userId);
                    serviceResponse.Message = "AI project does not exist or you do not have access.";
                    return serviceResponse;
                }

                // Validate the user has necessary access (Owner or Edit)
                var userAccessForProject = existingProjectEntity.ProjectUsers?.FirstOrDefault(pu =>
                    pu.AIProjectId == existingProjectEntity.Id &&
                    pu.UserId == _userId &&
                    (pu.AccessType == ProjectUserAccessEnum.Owner || pu.AccessType == ProjectUserAccessEnum.Edit)
                );

                if (existingProjectEntity.CreatedByUserId != _userId && userAccessForProject == null)
                {
                    _logger.LogWarning("User {UserId} is not authorized to modify AI project ID {ProjectId}", _userId, aiProjectDto.Id);
                    serviceResponse.Message = "You do not have permission to modify this AI project.";
                    return serviceResponse;
                }

                // Validate project name uniqueness excluding the current project itself
                string trimmedNewProjectName = aiProjectDto.Name?.Trim() ?? string.Empty;

                var duplicateProjectWithName = await _unitOfWork.AIProjectRepo
                    .GetByConditionAsync(project =>
                        project.CreatedByUserId == _userId &&
                        project.Name.ToLower() == trimmedNewProjectName.ToLower() &&
                        project.Id != aiProjectDto.Id)
                    .FirstOrDefaultAsync();

                if (duplicateProjectWithName != null)
                {
                    _logger.LogInformation("AI project name '{ProjectName}' already exists for user {UserId}", trimmedNewProjectName, _userId);
                    serviceResponse.StatusCode = 409;
                    serviceResponse.Message = "An AI project with the same name already exists. Please enter a unique name.";
                    return serviceResponse;
                }

                // Clean string properties of DTO before applying updates
                aiProjectDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiProjectDto);

                // Map the updated properties to the existing entity
                var updatedProjectEntity = aiProjectDto.Adapt(existingProjectEntity);

                // Update audit fields for modification
                updatedProjectEntity.CreatedByUserId = _userId;
                updatedProjectEntity.LastModifiedByUserId = _userId;

                // Update the project entity in the repository
                _unitOfWork.AIProjectRepo.Update(updatedProjectEntity);

                // Save changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to save updated AI project ID {ProjectId} for user {UserId}", aiProjectDto.Id, _userId);
                    return serviceResponse;
                }

                _logger.LogInformation("AI project ID {ProjectId} updated successfully for user {UserId}", aiProjectDto.Id, _userId);

                // Return updated project DTO
                serviceResponse.Data = updatedProjectEntity.Adapt<AIProjectDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "AI project updated successfully.";
            }
            catch (Exception ex)
            {
                // Log the exception if something goes wrong during project update
                _logger.LogError(ex, "Exception occurred while updating AI project ID {ProjectId} for user {UserId}", aiProjectDto.Id, _userId);
            }

            return serviceResponse;
        }

        // Deletes an AI project by ID if the current user is authorized.
        public async Task<ServiceResponse<bool>> DeleteAIProjectAsync(Guid projectId)
        {
            var serviceResponse = new ServiceResponse<bool>
            {
                Data = false,
                Message = "Failed to delete AI project. Please try again."
            };

            try
            {
                _logger.LogInformation("Deleting AI project ID {ProjectId} for user {UserId}", projectId, _userId);

                // Retrieve the project including related project users for access validation
                var projectToDelete = await _unitOfWork.AIProjectRepo
                    .GetByConditionAsync(project =>
                        project.Id == projectId &&
                        (
                            project.CreatedByUserId == _userId ||
                            (project.ProjectUsers != null && project.ProjectUsers.Any(pu => pu.UserId == _userId))
                        )
                    )
                    .Include(project => project.ProjectUsers)
                    .SingleOrDefaultAsync();

                // Check if the project exists and the user has permission to delete it
                if (projectToDelete == null)
                {
                    _logger.LogWarning("AI project ID {ProjectId} does not exist or user {UserId} has no access", projectId, _userId);
                    serviceResponse.Message = "AI project does not exist or you do not have access.";
                    return serviceResponse;
                }

                // Check if the user has Owner access to delete the project
                var userAccessWithOwnerRights = projectToDelete.ProjectUsers?.FirstOrDefault(w =>
                    w.AIProjectId == projectToDelete.Id &&
                    w.UserId == _userId &&
                    w.AccessType == ProjectUserAccessEnum.Owner
                );

                if (projectToDelete.CreatedByUserId != _userId && userAccessWithOwnerRights == null)
                {
                    _logger.LogWarning("User {UserId} is not authorized to delete AI project ID {ProjectId}", _userId, projectId);
                    serviceResponse.Message = "You do not have permission to delete this AI project.";
                    return serviceResponse;
                }

                // Proceed with deletion of the project
                _unitOfWork.AIProjectRepo.Delete(projectToDelete);

                // Save the deletion to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to delete AI project ID {ProjectId} for user {UserId}", projectId, _userId);
                    return serviceResponse;
                }

                _logger.LogInformation("AI project ID {ProjectId} deleted successfully for user {UserId}", projectId, _userId);

                serviceResponse.Data = true;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "AI project deleted successfully.";
            }
            catch (Exception ex)
            {
                // Log error if deletion fails
                _logger.LogError(ex, "Exception occurred while deleting AI project ID {ProjectId} for user {UserId}", projectId, _userId);
            }

            return serviceResponse;
        }

        // Deletes multiple AI projects based on a list of IDs if the user is authorized.
        public async Task<ServiceResponse<bool>> DeleteMultipleAIProjectsAsync(IEnumerable<Guid> aiProjectIds)
        {
            var serviceResponse = new ServiceResponse<bool>
            {
                Data = false,
                Message = "Failed to delete AI projects. Please try again."
            };

            try
            {
                // Log information on which projects are being deleted
                _logger.LogInformation("Deleting multiple AI projects for user {UserId}, Project IDs: {ProjectIds}", _userId, string.Join(",", aiProjectIds));

                foreach (var projectId in aiProjectIds)
                {
                    var projectToDelete = await _unitOfWork.AIProjectRepo
                        .GetByConditionAsync(project =>
                            project.Id == projectId &&
                            (
                                project.CreatedByUserId == _userId ||
                                (project.ProjectUsers != null && project.ProjectUsers.Any(pu => pu.UserId == _userId))
                            )
                        )
                        .Include(project => project.ProjectUsers)
                        .SingleOrDefaultAsync();

                    if (projectToDelete != null)
                    {
                        // Check if the user has Owner access to delete the project
                        var userAccessWithOwnerRights = projectToDelete.ProjectUsers?.FirstOrDefault(w =>
                            w.AIProjectId == projectToDelete.Id &&
                            w.UserId == _userId &&
                            w.AccessType == ProjectUserAccessEnum.Owner
                        );

                        if (projectToDelete.CreatedByUserId != _userId && userAccessWithOwnerRights == null)
                        {
                            _logger.LogWarning("User {UserId} is not authorized to delete AI project ID {ProjectId}", _userId, projectId);
                            continue; // Skip to next project in the list
                        }

                        // Proceed with deletion of the project
                        _unitOfWork.AIProjectRepo.Delete(projectToDelete);
                    }
                    else
                    {
                        _logger.LogWarning("AI project ID {ProjectId} does not exist or user {UserId} has no access", projectId, _userId);
                    }
                }

                // Save the deletions to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogError("Failed to delete AI projects for user {UserId}", _userId);
                    return serviceResponse;
                }

                _logger.LogInformation("Multiple AI projects deleted successfully for user {UserId}", _userId);

                serviceResponse.Data = true;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "AI projects deleted successfully.";
            }
            catch (Exception ex)
            {
                // Log the exception if something goes wrong during multiple project deletion
                _logger.LogError(ex, "Exception occurred while deleting multiple AI projects for user {UserId}", _userId);
            }

            return serviceResponse;
        }
        // Retrieves an AI project by its ID for the current user, including related data.
        public async Task<ServiceResponse<AIProjectDto>> GetAIProjectByIdAsync(Guid projectId)
        {
            var serviceResponse = new ServiceResponse<AIProjectDto>
            {
                Data = null,
                Message = "Failed to retrieve ai project. Please try again."
            };

            try
            {
                _logger.LogInformation("Fetching AI project ID {ProjectId} for user {UserId}", projectId, _userId);

                // Query AI project by ID, including related entities, ensuring user has access (creator or shared)
                var aiProjectDto = await _unitOfWork.AIProjectRepo
                    .GetByConditionAsync(w =>
                        w.Id == projectId &&
                        (
                            w.CreatedByUserId == _userId ||
                            (w.ProjectUsers != null && w.ProjectUsers.Any(pu => pu.UserId == _userId))
                        )
                    )
                    .AsNoTracking()
                    .Include(i => i.ProjectUsers)
                    .Include(i => i.Versions!)
                        .ThenInclude(version => version.Tasks)
                    .ProjectToType<AIProjectDto>()
                    .SingleOrDefaultAsync();

                if (aiProjectDto == null)
                {
                    _logger.LogWarning("AI project ID {ProjectId} does not exist or user {UserId} has no access", projectId, _userId);
                    serviceResponse.Message = "AI project does not exist or you do not have access.";
                    return serviceResponse;
                }

                _logger.LogInformation("AI project ID {ProjectId} retrieved successfully for user {UserId}", projectId, _userId);

                serviceResponse.Data = aiProjectDto;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "AI project retrieved successfully.";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Exception occurred while fetching AI project ID {ProjectId} for user {UserId}", projectId, _userId);
            }

            return serviceResponse;
        }
    }
}

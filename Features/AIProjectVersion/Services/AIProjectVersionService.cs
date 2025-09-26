namespace MLModelBuilderAPIs.Services;

public class AIProjectVersionService : IAIProjectVersionService
{
    private readonly ILogger<AIProjectVersionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public AIProjectVersionService(
        ILogger<AIProjectVersionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Extract the current user's ID from the HTTP context claims
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all versions associated with a specific AI project for the authenticated user
    public async Task<ServiceResponse<IEnumerable<AIProjectVersionDto>>> GetAIProjectVersionsByProjectIdAsync(Guid aiProjectId)
    {
        _logger.LogInformation("Starting retrieval of all versions for AI project ID: {ProjectId} by user: {UserId}", aiProjectId, _userId);

        // Initialize the service response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<AIProjectVersionDto>>
        {
            Data = null,
            Message = "Failed to retrieve AI project versions at this time. Please try again later."
        };

        try
        {
            // Prepare query to fetch AI project versions by project ID
            // Includes related AI project and user info, orders by newest first
            var queryForProjectVersions = _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(version => version.AIProjectId == aiProjectId)
                .AsNoTracking()
                .Include(version => version.AIProject)
                .Include(version => version.CreatedByUser)
                .Include(version => version.LastModifiedByUser)
                .OrderByDescending(version => version.CreatedOn);

            _logger.LogDebug("Executing database query for AI project versions tied to project ID: {ProjectId}", aiProjectId);

            // Execute the query and project results into a list of DTOs asynchronously
            var retrievedProjectVersions = await queryForProjectVersions
                .ProjectToType<AIProjectVersionDto>()
                .ToListAsync();

            _logger.LogDebug("Database returned {VersionCount} AI project versions for project ID: {ProjectId}", retrievedProjectVersions.Count, aiProjectId);

            // Populate the service response with retrieved data and success status
            serviceResponse.Data = retrievedProjectVersions;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI project versions retrieved successfully.";

            _logger.LogInformation("Successfully fetched {VersionCount} versions for AI project ID {ProjectId} requested by user {UserId}", retrievedProjectVersions.Count, aiProjectId, _userId);
        }
        catch (Exception ex)
        {
            // Log exception details for troubleshooting
            _logger.LogError(ex, "Failed to retrieve AI project versions for project ID {ProjectId} requested by user {UserId}", aiProjectId, _userId);
        }

        // Return the final service response
        return serviceResponse;
    }

    // Retrieves a specific AI project version by its unique ID
    public async Task<ServiceResponse<AIProjectVersionDto>> GetAIProjectVersionByIdAsync(Guid aiProjectVersionId)
    {
        _logger.LogInformation("Starting retrieval of AI project version ID: {VersionId} for user {UserId}.", aiProjectVersionId, _userId);

        // Initialize the response with default failure state and message
        var serviceResponse = new ServiceResponse<AIProjectVersionDto>
        {
            Data = null,
            Message = "Failed to retrieve ai project version. Please try again."
        };

        try
        {
            // Build and execute a query to fetch the AI project version entity by ID, including its related AI project and creator user information, returning a single entity or null if not found
            var aiProjectVersionEntity = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == aiProjectVersionId
                )
                .Include(i => i.AIProject)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .SingleOrDefaultAsync();

            _logger.LogDebug("Executing database query for ai project version ID: {VersionId}", aiProjectVersionId);

            // Check if the requested AI project version exists
            if (aiProjectVersionEntity == null)
            {
                _logger.LogWarning("AI project version ID: {VersionId} not found for user: {UserId}.", aiProjectVersionId, _userId);
                serviceResponse.Message = "AI project version not found.";
                return serviceResponse;
            }

            // Map the entity to the DTO and update the response accordingly
            serviceResponse.Data = aiProjectVersionEntity.Adapt<AIProjectVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI project version retrieved successfully.";

            _logger.LogInformation("Successfully retrieved AI project version ID: {VersionId} for user {UserId}.", aiProjectVersionId, _userId);
        }
        catch (Exception ex)
        {
            // Log the exception with details for debugging
            _logger.LogError(ex, "Error occurred while retrieving AI project version ID: {VersionId} for user {UserId}.", aiProjectVersionId, _userId);
        }

        // Return the service response object
        return serviceResponse;
    }

    // Creates a new version entry for an existing AI project and saves it to the database
    public async Task<ServiceResponse<AIProjectVersionDto>> CreateAIProjectVersionAsync(AIProjectVersionDto projectVersionDto)
    {
        _logger.LogInformation("Starting creation of a new project version for AI project ID: {ProjectId} by user {UserId}.", projectVersionDto.AIProjectId, _userId);

        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<AIProjectVersionDto>
        {
            Data = null,
            Message = "Failed to insert project version. Please try again."
        };

        try
        {
            // Retrieve the AI project by ID along with its existing versions to determine the next version number
            var aiProjectEntity = await _unitOfWork.AIProjectRepo
                .GetByConditionAsync(w =>
                    w.Id == projectVersionDto.AIProjectId
                )
                .Include(i => i.Versions)
                .SingleOrDefaultAsync();

            _logger.LogDebug("Executing query to fetch AI project with ID: {ProjectId}", projectVersionDto.AIProjectId);

            // Verify the AI project exists before proceeding
            if (aiProjectEntity == null)
            {
                _logger.LogError("AI project with ID {ProjectId} not found. Cannot create version.", projectVersionDto.AIProjectId);
                serviceResponse.Message = "AI project not found.";
                return serviceResponse;
            }

            // Trim whitespace from all string properties in the incoming DTO for data cleanliness
            projectVersionDto = TrimDtoStringPropsUtil.TrimDtoStringProps(projectVersionDto);
            _logger.LogDebug("Trimmed string properties in project version DTO.");

            // Map the cleaned DTO to a new AIProjectVersion entity instance
            var newProjectVersionEntity = projectVersionDto.Adapt<AIProjectVersion>();

            // Calculate the new version number based on existing version count
            int newVersionNumber = (aiProjectEntity.Versions
                .OrderByDescending(o => o.VersionNumber)
                .FirstOrDefault()?.VersionNumber ?? 0) + 1;
            newProjectVersionEntity.VersionNumber = newVersionNumber;

            // Populate auditing fields with user
            newProjectVersionEntity.CreatedByUserId = _userId;
            newProjectVersionEntity.LastModifiedByUserId = _userId;

            _logger.LogDebug("Prepared new project version entity with version number: {VersionNumber}", newVersionNumber);

            // Add the new version entity to the repository for insertion
            await _unitOfWork.AIProjectVersionRepo.InsertAsync(newProjectVersionEntity);

            // Attempt to persist changes to the database
            bool saveSuccessful = await _unitOfWork.SaveAsync();
            if (!saveSuccessful)
            {
                _logger.LogError("Failed to save the new project version to the database.");
                return serviceResponse;
            }

            // On successful save, map the entity back to DTO for response
            serviceResponse.Data = newProjectVersionEntity.Adapt<AIProjectVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Project version created successfully.";

            _logger.LogInformation("Successfully created project version with ID {VersionId} for AI project ID {ProjectId} by user {UserId}.", newProjectVersionEntity.Id, projectVersionDto.AIProjectId, _userId);
        }
        catch (Exception ex)
        {
            // Log any exceptions that occur during the process
            _logger.LogError(ex, "Exception occurred while creating project version for AI project ID {ProjectId} by user {UserId}.", projectVersionDto.AIProjectId, _userId);
        }

        // Return the service response containing either success data or failure message
        return serviceResponse;
    }

    // Updates an existing AI project version if it has not been published yet
    public async Task<ServiceResponse<AIProjectVersionDto>> UpdateAIProjectVersionAsync(AIProjectVersionDto aiProjectVersionDto)
    {
        // Log the start of the update operation including the project version ID and the current user ID
        _logger.LogInformation("Starting update for AI project version ID: {VersionId} by user {UserId}.", aiProjectVersionDto.Id, _userId);

        // Initialize the service response with a default failure message
        var serviceResponse = new ServiceResponse<AIProjectVersionDto>
        {
            Data = null,
            Message = "Failed to update AI project version. Please try again."
        };

        try
        {
            // Fetch the existing AI project version entity matching the provided version ID
            var existingVersionEntity = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(w => w.Id == aiProjectVersionDto.Id)
                .SingleOrDefaultAsync();

            // Check if the existing AI project version entity was found in the database
            if (existingVersionEntity == null)
            {
                _logger.LogInformation("AI project version ID {VersionId} not found. Update operation aborted.", aiProjectVersionDto.Id);
                serviceResponse.Message = "AI project version does not exist.";
                return serviceResponse;
            }

            // Prevent updating if the AI project version is already published to maintain data integrity
            if (existingVersionEntity.IsPublished)
            {
                _logger.LogWarning("Attempted to update published AI project version ID: {VersionId}, which is not allowed.", aiProjectVersionDto.Id);
                serviceResponse.Message = "Published AI project versions cannot be updated.";
                return serviceResponse;
            }

            // Trim any whitespace from string properties in the incoming DTO to clean data before updating
            aiProjectVersionDto = TrimDtoStringPropsUtil.TrimDtoStringProps(aiProjectVersionDto);
            _logger.LogDebug("Trimmed string properties of AI project version DTO before update.");

            // Map the properties from the DTO onto the existing entity to reflect updated values
            aiProjectVersionDto.Adapt(existingVersionEntity);

            // Update the 'LastModifiedByUserId' to the current user performing the update for audit tracking
            existingVersionEntity.LastModifiedByUserId = _userId;

            // Mark the entity as updated in the repository to prepare for saving changes
            _unitOfWork.AIProjectVersionRepo.Update(existingVersionEntity);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save updated AI project version ID: {VersionId} to the database.", aiProjectVersionDto.Id);
                return serviceResponse;
            }

            // Map the updated entity back to a DTO for returning in the response
            serviceResponse.Data = existingVersionEntity.Adapt<AIProjectVersionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "AI project version updated successfully.";

            // Log the successful update operation including project version and AI project IDs, and user ID
            _logger.LogInformation("Successfully updated AI project version ID: {VersionId} for AI project ID: {ProjectId} by user {UserId}.", existingVersionEntity.Id, aiProjectVersionDto.AIProjectId, _userId);
        }
        catch (Exception ex)
        {
            // Log the exception with full context to assist in troubleshooting any errors during update
            _logger.LogError(ex, "Exception occurred while updating AI project version ID: {VersionId} by user {UserId}.", aiProjectVersionDto.Id, _userId);
        }

        // Return the service response indicating either success or failure of the update operation
        return serviceResponse;
    }

    // Deletes a single AI project version identified by the provided version ID
    public async Task<ServiceResponse<bool>> DeleteAIProjectVersionAsync(Guid aiProjectVersionId)
    {
        _logger.LogInformation("Starting deletion of project version ID: {VersionId} by user {UserId}.", aiProjectVersionId, _userId);

        // Initialize service response with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete project version. Please try again."
        };

        try
        {
            // Fetch AI project version entity matching the provided version ID
            var projectVersionEntity = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(w => w.Id == aiProjectVersionId)
                .SingleOrDefaultAsync();

            _logger.LogDebug("Executing query to fetch project version ID: {VersionId} for deletion.", aiProjectVersionId);

            // Verify that the project version exists before attempting deletion
            if (projectVersionEntity == null)
            {
                _logger.LogInformation("Project version ID {VersionId} does not exist. Deletion aborted.", aiProjectVersionId);
                serviceResponse.Message = "Project version does not exist.";
                return serviceResponse;
            }

            // Remove the project version entity from the repository
            _unitOfWork.AIProjectVersionRepo.Delete(projectVersionEntity);

            // Save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save deletion of project version ID: {VersionId}.", aiProjectVersionId);
                return serviceResponse;
            }

            // Update the service response to indicate successful deletion
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Project version deleted successfully.";

            _logger.LogInformation("Successfully deleted project version ID: {VersionId} for AI project ID: {ProjectId} by user {UserId}.", aiProjectVersionId, projectVersionEntity.AIProjectId, _userId);
        }
        catch (Exception ex)
        {
            // Log any exceptions encountered during deletion process
            _logger.LogError(ex, "Exception occurred while deleting project version ID: {VersionId} by user {UserId}.", aiProjectVersionId, _userId);
        }

        // Return the final service response
        return serviceResponse;
    }

    // Deletes multiple AI project versions given a collection of version IDs
    public async Task<ServiceResponse<bool>> DeleteMultipleAIProjectVersionsAsync(IEnumerable<Guid> aiProjectVersionIds)
    {
        _logger.LogInformation("Starting bulk deletion of project versions by user {UserId}. Count of requested deletions: {Count}", _userId, aiProjectVersionIds?.Count() ?? 0);

        // Initialize service response with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete project versions. Please try again."
        };

        try
        {
            // Validate input list of project version IDs is not null or empty
            if (aiProjectVersionIds == null || !aiProjectVersionIds.Any())
            {
                _logger.LogWarning("No project version IDs provided for bulk deletion by user {UserId}.", _userId);
                serviceResponse.Message = "No version IDs provided.";
                return serviceResponse;
            }

            // Build query to fetch all AI project versions matching provided IDs and owned by the current user
            var versionsToDeleteQuery = _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(version => aiProjectVersionIds.Contains(version.Id));

            _logger.LogDebug("Executing query to fetch project versions for bulk deletion.");

            // Execute query and retrieve matching project version entities
            var projectVersionEntities = await versionsToDeleteQuery.ToListAsync();

            // Check if any matching versions were found
            if (!projectVersionEntities.Any())
            {
                _logger.LogInformation("No matching project versions found for bulk deletion for user {UserId}.", _userId);
                serviceResponse.Message = "No matching project versions found.";
                return serviceResponse;
            }

            // Delete all the fetched project version entities
            _unitOfWork.AIProjectVersionRepo.Delete(projectVersionEntities);

            // Attempt to save changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save bulk deletion of project versions for user {UserId}.", _userId);
                return serviceResponse;
            }

            // Update service response to indicate successful deletion
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{projectVersionEntities.Count} project versions deleted successfully.";

            _logger.LogInformation("Deleted {Count} project versions successfully for user {UserId}.", projectVersionEntities.Count, _userId);
        }
        catch (Exception ex)
        {
            // Log any exceptions encountered during the deletion process
            _logger.LogError(ex, "Exception occurred while bulk deleting project versions for user {UserId}.", _userId);
        }

        // Return the final service response
        return serviceResponse;
    }

    // Publishes a specific AI project version by setting its published flag and date
    public async Task<ServiceResponse<bool>> PublishAIProjectVersionAsync(PublishAIProjectVersionDto publishAIProjectVersionDto)
    {
        _logger.LogInformation("Starting publish operation for AI project version ID: {VersionId} by user {UserId}.", publishAIProjectVersionDto.Id, _userId);

        // Initialize service response with default failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to publish the project version. Please try again."
        };

        try
        {
            // Fetch AI project version entity matching the provided version ID
            var projectVersionEntity = await _unitOfWork.AIProjectVersionRepo
                .GetByConditionAsync(w => w.Id == publishAIProjectVersionDto.Id)
                .SingleOrDefaultAsync();


            // Check if the AI project version exists
            if (projectVersionEntity == null)
            {
                _logger.LogError("AI project version ID: {VersionId} not found during publish operation.", publishAIProjectVersionDto.Id);
                serviceResponse.Message = "Project version not found.";
                return serviceResponse;
            }

            // Prevent publishing if the version is already published
            if (projectVersionEntity.IsPublished)
            {
                _logger.LogInformation("AI project version ID: {VersionId} is already published.", publishAIProjectVersionDto.Id);
                serviceResponse.Message = "Project version is already published.";
                return serviceResponse;
            }

            // Mark the project version as published and set the current UTC timestamp
            projectVersionEntity.IsPublished = true;
            projectVersionEntity.PublishedOn = DateTimeOffset.UtcNow;
            projectVersionEntity.LastModifiedByUserId = _userId;

            _logger.LogDebug("AI project version ID: {VersionId} marked as published.", publishAIProjectVersionDto.Id);

            // Update the project version entity in the repository
            _unitOfWork.AIProjectVersionRepo.Update(projectVersionEntity);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save publishing changes for AI project version ID: {VersionId}.", publishAIProjectVersionDto.Id);
                return serviceResponse;
            }

            // Update service response to indicate success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Project version published successfully.";

            _logger.LogInformation("Successfully published AI project version ID: {VersionId} by user {UserId}.", publishAIProjectVersionDto.Id, _userId);
        }
        catch (Exception ex)
        {
            // Log any exceptions encountered during the publish operation
            _logger.LogError(ex, "Exception occurred while publishing AI project version ID: {VersionId} by user {UserId}.", publishAIProjectVersionDto.Id, _userId);
        }

        // Return the final service response
        return serviceResponse;
    }
}

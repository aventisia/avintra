namespace AccountsAPIs.Services;

public class SpaceTableService : ISpaceTableService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<SpaceTableService> _logger;
    private readonly Guid _userId;

    public SpaceTableService(IUnitOfWork unitOfWork, ILogger<SpaceTableService> logger, IHttpContextAccessor httpContextAccessor)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;

        // Set _userId from the HTTP context, defaulting to an empty GUID if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

    }

    // Retrieves all spaces from the database.
    public async Task<ServiceResponse<IEnumerable<SpaceTableDto>>> GetAllSpacesAsync()
    {
        // Prepare the default response with an error message
        var serviceResponse = new ServiceResponse<IEnumerable<SpaceTableDto>>
        {
            Data = null,
            Message = "Failed to retrieve spaces. Please try again."
        };

        try
        {
            // Fetch all space records from the repository
            var spaceEntities = await _unitOfWork.SpaceRepo
                .GetAllAsync()
                .Include(i => i.CreatedByUser)
                .ToListAsync();

            // Map the space entities to DTOs
            serviceResponse.Data = spaceEntities.Adapt<IEnumerable<SpaceTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Spaces retrieved successfully.";

            // Log the total count of retrieved spaces
            _logger.LogInformation("Retrieved {Count} spaces from the database.", spaceEntities.Count);
        }
        catch (Exception ex)
        {
            // Log any unexpected exception
            _logger.LogError(ex, "Failed to retrieve spaces due to an error.");
        }

        // Return the response with data or failure message
        return serviceResponse;
    }

    // Retrieves all spaces from the database.
    public async Task<ServiceResponse<IEnumerable<SelectOption>>> GetSelectableSpaceOptionsAsync()
    {
        // Initialize the response object with a default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<SelectOption>>
        {
            Data = null,
            Message = "Failed to retrieve spaces optins. Please try again."
        };

        try
        {
            // Retrieve all space entities along with the user who created them
            var spaceEntities = await _unitOfWork.SpaceRepo
                .GetAllAsync()
                .ProjectToType<SelectOption>()
                .ToListAsync();

            // Map the space entities to SelectOption objects
            serviceResponse.Data = spaceEntities.Adapt<IEnumerable<SelectOption>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Spaces retrieved successfully.";

            // Log success with the number of spaces retrieved
            _logger.LogInformation("Successfully retrieved {Count} space(s) from the database.", spaceEntities.Count);
        }
        catch (Exception ex)
        {
            // Log the exception with full error details
            _logger.LogError(ex, "An error occurred while retrieving spaces from the database.");
        }

        // Return the final response
        return serviceResponse;
    }

    // Retrieves a specific space by its unique identifier.
    public async Task<ServiceResponse<SpaceTableDto>> GetSpaceByIdAsync(Guid spaceId)
    {
        // Initialize the response with a default failure message
        var serviceResponse = new ServiceResponse<SpaceTableDto>
        {
            Data = null,
            Message = "Unable to retrieve space. Please try again."
        };

        try
        {
            // Log the operation attempt
            _logger.LogInformation("Fetching space with ID: {SpaceId}", spaceId);

            // Query the repository for a space matching the provided ID
            var spaceEntity = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(s => s.Id == spaceId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            // If no matching space is found, return a warning
            if (spaceEntity == null)
            {
                _logger.LogWarning("No space found with ID: {SpaceId}", spaceId);
                serviceResponse.Message = "Space not found.";
                return serviceResponse;
            }

            // Map the entity to a DTO for the response
            serviceResponse.Data = spaceEntity.Adapt<SpaceTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Space retrieved successfully.";

            // Log the successful retrieval
            _logger.LogInformation("Successfully retrieved space with ID: {SpaceId}", spaceId);
        }
        catch (Exception ex)
        {
            // Log any errors that occur during the operation
            _logger.LogError(ex, "Error occurred while retrieving space with ID: {SpaceId}", spaceId);
        }

        // Return the result
        return serviceResponse;
    }

    // Create new space
    public async Task<ServiceResponse<SpaceTableDto>> CreateSpaceAsync(SpaceDto spaceDto)
    {
        // Prepare the default response with an error message
        var serviceResponse = new ServiceResponse<SpaceTableDto>
        {
            Data = null,
            Message = "Failed to create space. Please try again later."
        };

        try
        {
            // Log the start of space creation
            _logger.LogInformation("Starting creation of space: {SpaceName}", spaceDto.Name);

            // Check if a space with the same name already exists (case-insensitive)
            var existingSpace = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(s => s.Name.ToLower() == spaceDto.Name.ToLower())
                .SingleOrDefaultAsync();

            if (existingSpace != null)
            {
                _logger.LogWarning("Creation aborted: A space named '{SpaceName}' already exists.", spaceDto.Name);
                serviceResponse.Message = $"A space with the name '{spaceDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Trim string properties in the Data Transfer Object (DTO)
            spaceDto = TrimDtoStringPropsUtil.TrimDtoStringProps(spaceDto);

            // Map DTO to entity and assign new ID
            var newSpace = spaceDto.Adapt<Space>();
            newSpace.CreatedByUserId = _userId;
            newSpace.LastModifiedByUserId = _userId;

            // Add space to repository
            await _unitOfWork.SpaceRepo.InsertAsync(newSpace);

            // Persist changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save the newly created space: {SpaceName}", spaceDto.Name);
                return serviceResponse;
            }

            // Create space-user associations and save them to the database
            var spaceUsers = spaceDto.UserIds.Select(userId => new SpaceUser
            {
                UserId = userId,
                SpaceId = newSpace.Id,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            });

            await _unitOfWork.SpaceUserRepo.InsertAsync(spaceUsers);

            // Persist changes for the space-users
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Error occurred while saving space-users for space: {SpaceName}", spaceDto.Name);
                return serviceResponse;
            }

            // Map result and prepare response
            serviceResponse.Data = newSpace.Adapt<SpaceTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Space created successfully.";

            _logger.LogInformation("Space created successfully with ID: {SpaceId}", newSpace.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error occurred while creating space: {SpaceName}", spaceDto.Name);
        }

        return serviceResponse;
    }

    // Update existing space
    public async Task<ServiceResponse<SpaceTableDto>> UpdateSpaceAsync(SpaceDto spaceDto)
    {
        // Prepare the default response with an error message
        var serviceResponse = new ServiceResponse<SpaceTableDto>
        {
            Data = null,
            Message = "Failed to update space. Please try again."
        };

        try
        {
            _logger.LogInformation("Attempting to update space with ID: {SpaceId}", spaceDto.Id);

            // Retrieve the existing space
            var existingSpace = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(w => w.Id == spaceDto.Id)
                .Include(i => i.SpaceUsers)
                .SingleOrDefaultAsync();

            if (existingSpace == null)
            {
                _logger.LogWarning("Update failed: Space with ID {SpaceId} not found.", spaceDto.Id);
                serviceResponse.Message = "Space not found.";
                return serviceResponse;
            }

            // Check for duplicate name (excluding current space)
            var duplicateSpace = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(w => w.Name.ToLower() == spaceDto.Name.ToLower() && w.Id != spaceDto.Id).SingleOrDefaultAsync();

            if (duplicateSpace != null)
            {
                _logger.LogWarning("Update failed: A space with name '{SpaceName}' already exists.", spaceDto.Name);
                serviceResponse.Message = $"A space with the name '{spaceDto.Name}' already exists.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }
            // Trim string properties in the spaceDto
            spaceDto = TrimDtoStringPropsUtil.TrimDtoStringProps(spaceDto);

            // Update the space entity using Mapster
            spaceDto.Adapt(existingSpace);
            existingSpace.LastModifiedByUserId = _userId;

            _unitOfWork.SpaceRepo.Update(existingSpace);

            // Handle users: Add new users and delete removed users
            var existingUserIds = existingSpace.SpaceUsers
            .Where(w => w.SpaceId == spaceDto.Id)
                .Select(s => s.UserId)
                .ToList();

            var usersToAdd = spaceDto.UserIds.Except(existingUserIds).ToList();
            var usersToRemove = existingUserIds.Except(spaceDto.UserIds).ToList();

            // Add new users
            var spaceUsersToAdd = usersToAdd.Select(userId => new SpaceUser
            {
                UserId = userId,
                SpaceId = existingSpace.Id,
                CreatedByUserId = _userId,
                LastModifiedByUserId = _userId
            }).ToList();

            // Remove users who are no longer part of the space
            var spaceUsersToRemove = existingSpace.SpaceUsers
                .Where(w => w.SpaceId == existingSpace.Id && usersToRemove.Contains(w.UserId))
                .ToList();

            // Delete users who are no longer in the request
            if (spaceUsersToRemove.Any())
            {
                _unitOfWork.SpaceUserRepo.Delete(spaceUsersToRemove);
            }

            // Insert new users into the space-user association
            if (spaceUsersToAdd.Any())
            {
                await _unitOfWork.SpaceUserRepo.InsertAsync(spaceUsersToAdd);
            }

            // Persist changes for the space and space-users
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save the updated space and space-users: {SpaceId}", spaceDto.Id);
                return serviceResponse;
            }

            // Prepare success response
            serviceResponse.Data = existingSpace.Adapt<SpaceTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Space updated successfully.";

            _logger.LogInformation("Space with ID {SpaceId} updated successfully.", spaceDto.Id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while updating space with ID: {SpaceId}", spaceDto.Id);
        }

        return serviceResponse;
    }

    // Deletes a space by its unique identifier.
    public async Task<ServiceResponse<bool>> DeleteSpaceAsync(Guid spaceId)
    {
        // Initialize a default failure response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Unable to delete the space. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating deletion for space with ID: {SpaceId}", spaceId);

            // Retrieve the space entity from the repository
            var spaceEntity = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(w => w.Id == spaceId)
                .SingleOrDefaultAsync();

            // Return early if the space is not found
            if (spaceEntity == null)
            {
                _logger.LogWarning("Deletion aborted. No space found with ID: {SpaceId}", spaceId);
                serviceResponse.Message = "Space not found.";
                return serviceResponse;
            }

            // Mark the entity for deletion
            _unitOfWork.SpaceRepo.Delete(spaceEntity);

            // Commit changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Database save failed while deleting space with ID: {SpaceId}", spaceId);
                return serviceResponse;
            }

            // Update response on success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Space deleted successfully.";

            _logger.LogInformation("Space with ID: {SpaceId} was deleted successfully.", spaceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while deleting space with ID: {SpaceId}", spaceId);
        }

        // Return the final result
        return serviceResponse;
    }

    // Deletes multiple spaces based on a list of unique identifiers.
    public async Task<ServiceResponse<bool>> DeleteSpacesAsync(List<Guid> spaceIds)
    {
        // Initialize a default failure response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete spaces. Please try again later."
        };

        try
        {
            _logger.LogInformation("Initiating bulk deletion for {Count} space(s).", spaceIds.Count);

            // Retrieve matching space entities from the repository
            var spaces = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(w => spaceIds.Contains(w.Id))
                .ToListAsync();

            // Return early if no spaces were found
            if (spaces == null || spaces.Count == 0)
            {
                _logger.LogWarning("Bulk deletion aborted. No matching spaces found.");
                serviceResponse.Message = "No matching spaces found to delete.";
                return serviceResponse;
            }

            // Mark all matching entities for deletion
            _unitOfWork.SpaceRepo.Delete(spaces);

            // Commit changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Database save failed while deleting multiple spaces.");
                return serviceResponse;
            }

            // Update response on success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Spaces deleted successfully.";

            _logger.LogInformation("Successfully deleted {Count} space(s).", spaces.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while deleting multiple spaces.");
        }

        // Return the final result
        return serviceResponse;
    }

    // Retrieves all users associated with a specific space.
    public async Task<ServiceResponse<IEnumerable<SpaceUserDto>>> GetSpaceUsersAsync(Guid spaceId)
    {
        // Prepare the default response with an error message
        var serviceResponse = new ServiceResponse<IEnumerable<SpaceUserDto>>
        {
            Message = "Failed to retrieve space users. Please try again later."
        };

        try
        {
            _logger.LogInformation("Fetching users for space with ID: {SpaceId}", spaceId);

            // Retrieve the space along with its associated users
            var space = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(s => s.Id == spaceId)
                .Include(i => i.SpaceUsers)
                    .ThenInclude(i2 => i2.User)
                .SingleOrDefaultAsync();

            // If the space is not found, return an appropriate response
            if (space == null)
            {
                _logger.LogWarning("Cannot retrieve users: Space with ID {SpaceId} not found.", spaceId);
                serviceResponse.Message = "Space not found.";
                return serviceResponse;
            }

            // Map the users to DTOs and prepare a successful response
            serviceResponse.Data = space.SpaceUsers.Adapt<IEnumerable<SpaceUserDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users retrieved successfully.";

            _logger.LogInformation("Successfully retrieved {UserCount} user(s) for space ID: {SpaceId}.", space.SpaceUsers.Count, spaceId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving users for space ID: {SpaceId}.", spaceId);
        }

        return serviceResponse;
    }
}
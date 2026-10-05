namespace AccountsAPIs.Services;

using System.Net.Http.Headers;
using System.Net.Http.Json;
using Newtonsoft.Json;

public class SpaceTableService : ISpaceTableService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<SpaceTableService> _logger;
    private readonly EnvironmentConfig _environmentConfig;
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly Guid _userId;
    private readonly Guid _tenantId;

    public SpaceTableService(
        IUnitOfWork unitOfWork,
        ILogger<SpaceTableService> logger,
        IHttpContextAccessor httpContextAccessor,
        EnvironmentConfig environmentConfig)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _environmentConfig = environmentConfig;
        _httpContextAccessor = httpContextAccessor;

        // Set _userId from the HTTP context, defaulting to an empty GUID if not found
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Set _tenantId from the HTTP context, defaulting to an empty GUID if not found
        _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());
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
            // Fetch all space records for the current tenant from the repository
            var spaceEntities = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(s => s.TenantId == _tenantId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.SpaceUsers)
                .ToListAsync();

            // Map the space entities to DTOs.
            // Materialize to a List so in-place mutations below persist across the
            // multiple enumerations (foreach, Select, and the response assignment).
            var spaceDtos = spaceEntities.Adapt<IEnumerable<SpaceTableDto>>().ToList();

            // Count distinct users per space from the SpaceUser membership table.
            var spaceUsers = await _unitOfWork.SpaceUserRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId)
                .ToListAsync();

            var userIdsBySpace = spaceUsers
                .GroupBy(g => g.SpaceId)
                .ToDictionary(g => g.Key, g => g.Select(x => x.UserId).Distinct().ToHashSet());

            // The default "Central" space is accessible by every user in the tenant by default,
            // regardless of explicit SpaceUser assignments. So its user count equals the total
            // number of non-default users in the tenant.
            var totalTenantUserCount = await _unitOfWork.AccountUserRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId && !w.IsDefault)
                .CountAsync();

            // Fetch aggregate usage metrics (published agents, execution time, machines) from WorkspaceAPIs,
            // keyed by SpaceId. The Central space has a null SpaceId in WorkspaceAPIs.
            var spaceSummaries = await GetSpaceSummariesAsync();

            // Populate aggregate counts for each space
            foreach (var spaceDto in spaceDtos)
            {
                var spaceEntity = spaceEntities.FirstOrDefault(s => s.Id == spaceDto.Id);
                if (spaceEntity == null) continue;

                // The default "Central" space is accessible by every tenant user by default,
                // so its user count reflects all users in the tenant. Non-default spaces only
                // count the users explicitly assigned via the SpaceUser membership table.
                if (spaceDto.IsDefault)
                {
                    spaceDto.TotalUsers = totalTenantUserCount;
                }
                else
                {
                    userIdsBySpace.TryGetValue(spaceDto.Id, out var explicitUserIds);
                    spaceDto.TotalUsers = explicitUserIds?.Count ?? 0;
                }

                // Aggregate metrics fetched from WorkspaceAPIs.
                // The Central space (IsDefault) maps to a null SpaceId in WorkspaceAPIs.
                var summary = spaceDto.IsDefault
                    ? spaceSummaries.FirstOrDefault(s => s.SpaceId == null)
                    : spaceSummaries.FirstOrDefault(s => s.SpaceId == spaceDto.Id);

                spaceDto.TotalPublishedAgents = summary?.TotalPublishedAgents ?? 0;
                spaceDto.TotalExecutionTime = summary?.TotalExecutionTime ?? 0;
                spaceDto.TotalMachinesAttached = summary?.TotalMachinesAttached ?? 0;
            }

            serviceResponse.Data = spaceDtos;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Spaces retrieved successfully.";

        }
        catch (Exception ex)
        {
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
            // Retrieve all space entities for the current tenant along with the user who created them
            var spaceEntities = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(s => s.TenantId == _tenantId)
                .ProjectToType<SelectOption>()
                .ToListAsync();

            // Map the space entities to SelectOption objects
            serviceResponse.Data = spaceEntities.Adapt<IEnumerable<SelectOption>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Spaces retrieved successfully.";

        }
        catch (Exception ex)
        {
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

        }
        catch (Exception ex)
        {
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
            // Community deployments are limited to one space regardless of plan data.
            var currentSpaceCount = _environmentConfig.IsCommunityDeployment
                ? await _unitOfWork.SpaceRepo
                    .GetByConditionAsync(s => s.TenantId == _tenantId)
                    .CountAsync()
                : 0;
            if (_environmentConfig.IsCommunityDeployment && currentSpaceCount >= 1)
            {
                _logger.LogWarning("Space creation blocked: community deployments support a single space.");
                serviceResponse.Message = "Your community edition supports a single space. Upgrade to create more spaces.";
                serviceResponse.StatusCode = 403;
                return serviceResponse;
            }

            // Check if a space with the same name already exists within the tenant (case-insensitive)
            var existingSpace = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(s => s.TenantId == _tenantId && s.Name.ToLower() == spaceDto.Name.ToLower())
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
            newSpace.TenantId = _tenantId;
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

            // Always include the creator as a member of the space so they show up
            // in the Tenant Admin Users table's Spaces column. Dedupe in case the
            // creator was already selected explicitly.
            if (!spaceDto.UserIds.Contains(_userId))
            {
                spaceDto.UserIds.Add(_userId);
            }

            // Create space-user associations only when users were selected, then save them.
            // Skipping the empty case avoids a redundant SaveAsync that reports failure (0 changes)
            // even though the space itself was already created successfully.
            if (spaceDto.UserIds.Count > 0)
            {
                var spaceUsers = spaceDto.UserIds.Select(userId => new SpaceUser
                {
                    UserId = userId,
                    SpaceId = newSpace.Id,
                    TenantId = _tenantId,
                    IsActive = true,
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
            }

            // Grant the creator Owner access in the WorkspaceAPIs ResourceShare table so
            // the creator's name appears in the Share dialog's "Shared User(s)" list.
            await AssignSpaceOwnerAsync(newSpace.Id);

            // Map result and prepare response
            serviceResponse.Data = newSpace.Adapt<SpaceTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Space created successfully.";

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
            // Community deployments are limited to the single seeded Central space.
            // Editing spaces requires upgrading to a commercial or enterprise plan.
            if (_environmentConfig.IsCommunityDeployment)
            {
                _logger.LogWarning("Space update blocked: community deployments support a single space.");
                serviceResponse.Message = "Your community edition supports a single space. Upgrade to manage more spaces.";
                serviceResponse.StatusCode = 403;
                return serviceResponse;
            }

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

            // The default "Central" space cannot be edited
            if (existingSpace.IsDefault)
            {
                _logger.LogWarning("Update failed: The default space cannot be edited. Space ID: {SpaceId}", spaceDto.Id);
                serviceResponse.Message = "The default space cannot be edited.";
                serviceResponse.StatusCode = 403;
                return serviceResponse;
            }

            // Check for duplicate name within the tenant (excluding current space)
            var duplicateSpace = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(w => w.TenantId == _tenantId && w.Name.ToLower() == spaceDto.Name.ToLower() && w.Id != spaceDto.Id).SingleOrDefaultAsync();

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
            // Community deployments are limited to the single seeded Central space.
            // Deleting spaces requires upgrading to a commercial or enterprise plan.
            if (_environmentConfig.IsCommunityDeployment)
            {
                _logger.LogWarning("Space deletion blocked: community deployments support a single space.");
                serviceResponse.Message = "Your community edition supports a single space. Upgrade to manage more spaces.";
                serviceResponse.StatusCode = 403;
                return serviceResponse;
            }

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

            // The default "Central" space cannot be deleted
            if (spaceEntity.IsDefault)
            {
                _logger.LogWarning("Deletion aborted. The default space cannot be deleted. Space ID: {SpaceId}", spaceId);
                serviceResponse.Message = "The default space cannot be deleted.";
                serviceResponse.StatusCode = 403;
                return serviceResponse;
            }

            // A space with published agents cannot be deleted.
            if (await HasPublishedAgentsAsync(spaceId))
            {
                _logger.LogWarning("Deletion aborted. Space {SpaceId} has published agents and cannot be deleted.", spaceId);
                serviceResponse.Message = "This space cannot be deleted because it has published agents. Unpublish or remove the agents first.";
                serviceResponse.StatusCode = 409;
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

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while deleting space with ID: {SpaceId}", spaceId);
        }

        // Return the final result
        return serviceResponse;
    }

    // Checks whether the given space has any published agents by querying the WorkspaceAPIs.
    private async Task<bool> HasPublishedAgentsAsync(Guid spaceId)
    {
        try
        {
            // Get the JWT of the current request to authenticate the cross-service call.
            var jwt = GetJwtOfRequestUtil.GetJwtOfRequest(_httpContextAccessor.HttpContext);

            // Call the WorkspaceAPIs "published" endpoint scoped to the given space.
            // The X-Space-Id header tells the WorkspaceAPIs to filter published agents by that space.
            var httpClient = new HttpClient(CreateInsecureHttpClientHandler());
            if (!string.IsNullOrEmpty(jwt) && jwt != "jwt-not-found")
            {
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwt);
            }
            httpClient.DefaultRequestHeaders.Add("X-Space-Id", spaceId.ToString());

            var response = await httpClient.GetAsync($"{_environmentConfig.WorkspaceApiBaseUrl}/api/agent/published");

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to query published agents for space {SpaceId}. Status: {Status}", spaceId, response.StatusCode);
                return false;
            }

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<ServiceResponse<IEnumerable<object>>>(content);

            // If the response contains any published agents, the space cannot be deleted.
            return result?.Data != null && result.Data.Any();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while checking published agents for space {SpaceId}.", spaceId);
            return false;
        }
    }

    // Retrieves aggregate usage metrics (published agents, execution time, machines) grouped by space
    // from the WorkspaceAPIs. The Central space is represented by a null SpaceId.
    private async Task<List<SpaceSummaryDto>> GetSpaceSummariesAsync()
    {
        try
        {
            // Get the JWT of the current request to authenticate the cross-service call.
            var jwt = GetJwtOfRequestUtil.GetJwtOfRequest(_httpContextAccessor.HttpContext);

            var httpClient = new HttpClient(CreateInsecureHttpClientHandler());
            if (!string.IsNullOrEmpty(jwt) && jwt != "jwt-not-found")
            {
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwt);
            }

            var response = await httpClient.GetAsync($"{_environmentConfig.WorkspaceApiBaseUrl}/api/space-summary/list");

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("Failed to query space summaries from WorkspaceAPIs. Status: {Status}", response.StatusCode);
                return new List<SpaceSummaryDto>();
            }

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<ServiceResponse<IEnumerable<SpaceSummaryDto>>>(content);

            return result?.Data?.ToList() ?? new List<SpaceSummaryDto>();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while retrieving space summaries from WorkspaceAPIs.");
            return new List<SpaceSummaryDto>();
        }
    }

    // Grants the space creator Owner access in the WorkspaceAPIs ResourceShare table
    // so the creator's name appears in the Share dialog's "Shared User(s)" list.
    private async Task AssignSpaceOwnerAsync(Guid spaceId)
    {
        try
        {
            // Get the JWT of the current request to authenticate the cross-service call.
            var jwt = GetJwtOfRequestUtil.GetJwtOfRequest(_httpContextAccessor.HttpContext);

            var httpClient = new HttpClient(CreateInsecureHttpClientHandler());
            if (!string.IsNullOrEmpty(jwt) && jwt != "jwt-not-found")
            {
                httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", jwt);
            }

            // POST to the WorkspaceAPIs resource-share endpoint. The WorkspaceAPIs
            // derives the tenant from the forwarded JWT's "tntid" claim and returns
            // 409 if the creator already has access (idempotent), so no special
            // handling is required here.
            var payload = new
            {
                resourceType = "Space",
                resourceId = spaceId,
                accessLevel = "Owner",
                userId = _userId
            };

            var response = await httpClient.PostAsJsonAsync(
                $"{_environmentConfig.WorkspaceApiBaseUrl}/api/resource-share",
                payload);

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Failed to assign space owner for space {SpaceId}. Status: {Status}",
                    spaceId,
                    response.StatusCode);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error while assigning space owner for space {SpaceId}.", spaceId);
        }
    }

    // Creates an HttpClientHandler that bypasses SSL certificate validation.
    // This is required for local development where the WorkspaceAPIs runs with an
    // untrusted self-signed development certificate (e.g. WSL).
    private static HttpClientHandler CreateInsecureHttpClientHandler()
    {
        var handler = new HttpClientHandler();
        handler.ServerCertificateCustomValidationCallback = HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
        return handler;
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
            // Community deployments are limited to the single seeded Central space.
            // Bulk deletion requires upgrading to a commercial or enterprise plan.
            if (_environmentConfig.IsCommunityDeployment)
            {
                _logger.LogWarning("Bulk space deletion blocked: community deployments support a single space.");
                serviceResponse.Message = "Your community edition supports a single space. Upgrade to manage more spaces.";
                serviceResponse.StatusCode = 403;
                return serviceResponse;
            }

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

            // Exclude the default "Central" space from bulk deletion
            var deletableSpaces = spaces.Where(w => !w.IsDefault).ToList();

            // All requested spaces are default spaces
            if (deletableSpaces.Count == 0)
            {
                _logger.LogWarning("Bulk deletion aborted. The default space cannot be deleted.");
                serviceResponse.Message = "The default space cannot be deleted.";
                serviceResponse.StatusCode = 403;
                return serviceResponse;
            }

            // A space with published agents cannot be deleted.
            var spacesWithPublishedAgents = new List<Space>();
            foreach (var space in deletableSpaces)
            {
                if (await HasPublishedAgentsAsync(space.Id))
                {
                    spacesWithPublishedAgents.Add(space);
                }
            }

            if (spacesWithPublishedAgents.Count > 0)
            {
                var names = string.Join(", ", spacesWithPublishedAgents.Select(s => s.Name));
                _logger.LogWarning("Bulk deletion aborted. Spaces with published agents cannot be deleted: {Names}", names);
                serviceResponse.Message = $"The following spaces cannot be deleted because they have published agents: {names}. Unpublish or remove the agents first.";
                serviceResponse.StatusCode = 409;
                return serviceResponse;
            }

            // Mark all matching entities for deletion
            _unitOfWork.SpaceRepo.Delete(deletableSpaces);

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

        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while retrieving users for space ID: {SpaceId}.", spaceId);
        }

        return serviceResponse;
    }

    // Adds the given users to a space (used by the share flow to sync space membership).
    public async Task<ServiceResponse<bool>> AddSpaceUsersAsync(Guid spaceId, List<Guid> userIds)
    {
        // Initialize a default failure response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to add users to the space. Please try again later."
        };

        try
        {
            if (userIds == null || userIds.Count == 0)
            {
                serviceResponse.Message = "No users were provided to add.";
                return serviceResponse;
            }

            // Verify the space exists and belongs to the current tenant.
            var space = await _unitOfWork.SpaceRepo
                .GetByConditionAsync(w => w.Id == spaceId && w.TenantId == _tenantId)
                .SingleOrDefaultAsync();

            if (space == null)
            {
                serviceResponse.Message = "Space not found.";
                return serviceResponse;
            }

            // Get the users already associated with the space to avoid duplicates.
            var existingUserIds = await _unitOfWork.SpaceUserRepo
                .GetByConditionAsync(w => w.SpaceId == spaceId && w.TenantId == _tenantId)
                .Select(s => s.UserId)
                .ToListAsync();

            var existingSet = existingUserIds.ToHashSet();

            // Build new SpaceUser records for users not already in the space.
            var toAdd = userIds
                .Where(id => !existingSet.Contains(id))
                .Select(id => new SpaceUser
                {
                    UserId = id,
                    SpaceId = spaceId,
                    TenantId = _tenantId,
                    IsActive = true,
                    CreatedByUserId = _userId,
                    LastModifiedByUserId = _userId
                })
                .ToList();

            if (toAdd.Count > 0)
            {
                await _unitOfWork.SpaceUserRepo.InsertAsync(toAdd);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to persist added space users for space {SpaceId}.", spaceId);
                    return serviceResponse;
                }
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users added to the space successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while adding users to space {SpaceId}.", spaceId);
        }

        return serviceResponse;
    }

    // Removes the given users from a space (used by the share flow to sync space membership).
    public async Task<ServiceResponse<bool>> RemoveSpaceUsersAsync(Guid spaceId, List<Guid> userIds)
    {
        // Initialize a default failure response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to remove users from the space. Please try again later."
        };

        try
        {
            if (userIds == null || userIds.Count == 0)
            {
                serviceResponse.Message = "No users were provided to remove.";
                return serviceResponse;
            }

            // Retrieve the SpaceUser records to remove.
            var toRemove = await _unitOfWork.SpaceUserRepo
                .GetByConditionAsync(w =>
                    w.SpaceId == spaceId &&
                    w.TenantId == _tenantId &&
                    userIds.Contains(w.UserId))
                .ToListAsync();

            if (toRemove.Count > 0)
            {
                _unitOfWork.SpaceUserRepo.Delete(toRemove);
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to persist removed space users for space {SpaceId}.", spaceId);
                    return serviceResponse;
                }
            }

            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Users removed from the space successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while removing users from space {SpaceId}.", spaceId);
        }

        return serviceResponse;
    }
}
namespace WorkspaceAPIs.Services
{
    public class BlockService : IBlockService
    {
        private readonly ILogger<BlockService> _logger;
        private readonly IUnitOfWork _unitOfWork;
        private readonly Guid _userId;
        private readonly Guid _tenantId;

        public BlockService(
            ILogger<BlockService> logger,
            IUnitOfWork unitOfWork,
            IHttpContextAccessor httpContextAccessor)
        {
            // Extract user ID and tenant ID from JWT claims in the HTTP context
            _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
            _tenantId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("tntid") ?? Guid.Empty.ToString());

            _logger = logger;
            _unitOfWork = unitOfWork;
        }

        // Retrieves a list of flow versions based on the specified flowId.
        public async Task<ServiceResponse<IEnumerable<FlowVersionDto>>> GetBlocksByIdAsync(Guid? flowId)
        {
            var serviceResponse = new ServiceResponse<IEnumerable<FlowVersionDto>>
            {
                Data = null,
                Message = "Failed to retrieve flow versions. Please try again."
            };

            try
            {
                // Fetch flow versions based on the provided flowId (if provided) and ensure the version is published
                var flowVersions = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    (!flowId.HasValue || w.FlowId == flowId.Value) &&
                    w.IsPublished
                )
                .Include(i => i.Flow)
                .ProjectToType<FlowVersionDto>()
                .ToListAsync();

                // If successful, set the retrieved data, success status, and success message
                serviceResponse.Data = flowVersions;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Flow versions retrieved successfully.";

                // Log the success with the count of flow versions retrieved and the flowId used
                _logger.LogInformation($"Successfully retrieved {flowVersions.Count()} flow versions for flowId: {flowId ?? Guid.Empty}. ");
            }
            catch (Exception ex)
            {
                // Log the exception details if an error occurs
                _logger.LogError(ex, $"Error occurred while retrieving flow versions for flowId: {flowId ?? Guid.Empty}.");
            }

            // Return the final response with success or failure
            return serviceResponse;
        }

        // Retrieves a flow version by its unique identifier (flowVersionId).
        public async Task<ServiceResponse<FlowVersionDto>> GetBlockByIdAsync(Guid flowVersionId)
        {
            var serviceResponse = new ServiceResponse<FlowVersionDto>
            {
                Data = null,
                Message = "Failed to retrieve flow version. Please try again."
            };

            try
            {
                // Fetch the flow version based on the provided flowVersionId and ensure it is published
                var flowVersion = await _unitOfWork.FlowVersionRepo
                .GetByConditionAsync(w =>
                    w.Id == flowVersionId &&
                    w.IsPublished
                )
                .Include(i => i.Flow)
                .SingleOrDefaultAsync();

                // If the flow version does not exist, return a failure message
                if (flowVersion == null)
                {
                    _logger.LogInformation($"FlowVersion with Id {flowVersionId} not found.");
                    serviceResponse.Message = "FlowVersion not found.";
                    return serviceResponse;
                }

                // Map the flow version entity to FlowVersionDto
                serviceResponse.Data = flowVersion.Adapt<FlowVersionDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Flow version retrieved successfully.";

                // Log the successful retrieval of the flow version
                _logger.LogInformation($"Successfully retrieved flow version with FlowVersionId {flowVersionId}.");
            }
            catch (Exception ex)
            {
                // Log any exception that occurs during the operation
                _logger.LogError(ex, $"Error occurred while retrieving flow version with FlowVersionId {flowVersionId}.");
            }

            // Return the final response with success or failure
            return serviceResponse;
        }

        // Inserts a new flow version into the database.
        public async Task<ServiceResponse<FlowVersionDto>> InsertBlockAsync(BlockDto blockDto)
        {
            var serviceResponse = new ServiceResponse<FlowVersionDto>
            {
                Data = null,
                Message = "Failed to insert flow version. Please try again."
            };

            try
            {
                // Check if a flow version with the same flowId and version already exists
                var existingFlowVersion = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.FlowId == blockDto.FlowId )
                    .SingleOrDefaultAsync();

                // Prevent inserting duplicate flow versions
                if (existingFlowVersion != null)
                {
                    _logger.LogError($"FlowVersion with FlowId {blockDto.FlowId} and VersionNumber {blockDto.VersionNumber} already exists.");
                    serviceResponse.Message = "A flow version with the given FlowId and VersionNumber already exists.";
                    return serviceResponse;
                }

                // Trim string properties to ensure no unwanted whitespace in the DTO
                blockDto = TrimDtoStringPropsUtil.TrimDtoStringProps(blockDto);

                // Map the DTO to the FlowVersion entity
                var newFlowVersion = blockDto.Adapt<FlowVersion>();

                // Set the user details for created and modified fields
                newFlowVersion.CreatedByUserId = _userId;
                newFlowVersion.LastModifiedByUserId = _userId;

                // Insert the new flow version into the repository
                await _unitOfWork.FlowVersionRepo.InsertAsync(newFlowVersion);

                // Attempt to save the new flow version entity into the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to save the new flow version.");
                    return serviceResponse;
                }

                // Set success data in the response
                serviceResponse.Data = newFlowVersion.Adapt<FlowVersionDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Flow version added successfully.";

                // Log the successful addition of the flow version
                _logger.LogInformation($"Flow version added successfully for FlowId {newFlowVersion.FlowId}, VersionNumber {newFlowVersion.VersionNumber}. Created by UserId {newFlowVersion.CreatedByUserId}.");
            }
            catch (Exception ex)
            {
                // Log any exception that occurs during the insert operation
                _logger.LogError(ex, "Exception occurred while adding a new flow version.");
            }

            // Return the final response
            return serviceResponse;
        }

        // Updates the properties of an existing flow version in the database.
        public async Task<ServiceResponse<FlowVersionDto>> UpdateBlockAsync(BlockDto blockDto)
        {
            var serviceResponse = new ServiceResponse<FlowVersionDto>
            {
                Data = null,
                Message = "Failed to update flow version. Please try again."
            };

            try
            {
                // Retrieve the existing flow version entity using the provided Id and ensure it was created by the current user
                var flowVersion = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.Id == blockDto.Id && w.CreatedByUserId == _userId)
                    .SingleOrDefaultAsync();

                // If the flow version doesn't exist, return an appropriate response
                if (flowVersion == null)
                {
                    _logger.LogInformation($"FlowVersion with Id {blockDto.Id} not found.");
                    serviceResponse.Message = "FlowVersion not found.";
                    return serviceResponse;
                }

                // Trim string properties to remove unnecessary whitespace
                blockDto = TrimDtoStringPropsUtil.TrimDtoStringProps(blockDto);

                // Update the properties of the flow version
                flowVersion.LastModifiedByUserId = _userId;

                // Update the flow version in the repository
                _unitOfWork.FlowVersionRepo.Update(flowVersion);

                // Attempt to save the changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning($"Failed to save update for flow version with Id {flowVersion.Id}");
                    return serviceResponse;
                }

                // On successful save, return the updated flow version and set success message
                serviceResponse.Data = flowVersion.Adapt<FlowVersionDto>();
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Flow version updated successfully.";

                // Log the successful update of the flow version
                _logger.LogInformation($"Flow version with Id {flowVersion.Id} updated successfully.");
            }
            catch (Exception ex)
            {
                // Log the exception in case of an error during the update process
                _logger.LogError(ex, $"Error occurred while updating flow version with Id {blockDto.Id}");
            }

            // Return the final response
            return serviceResponse;
        }

        // Deletes a flow version from the database based on the provided flow version id.
        public async Task<ServiceResponse<bool>> DeleteBlockAsync(Guid flowVersionId)
        {
            var serviceResponse = new ServiceResponse<bool>
            {
                Data = false,
                Message = "Failed to delete flow version. Please try again."
            };

            try
            {
                // Retrieve the flow version entity from the repository based on the provided Id and ensure it was created by the current user
                var flowVersion = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => w.Id == flowVersionId && w.CreatedByUserId == _userId)
                    .SingleOrDefaultAsync();

                // If the flow version doesn't exist, log and return the failure message
                if (flowVersion == null)
                {
                    _logger.LogInformation($"FlowVersion with FlowVersionId {flowVersionId} not found.");
                    serviceResponse.Message = "FlowVersion not found.";
                    return serviceResponse;
                }

                // Delete the flow version from the repository
                _unitOfWork.FlowVersionRepo.Delete(flowVersion);

                // Attempt to save the changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning($"Failed to save deletion of flow version with FlowVersionId {flowVersionId}");
                    return serviceResponse;
                }

                // On successful deletion, set success values in the response
                serviceResponse.Data = true;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Flow version deleted successfully.";

                // Log the successful deletion of the flow version
                _logger.LogInformation($"FlowVersion with FlowVersionId {flowVersionId} deleted successfully.");
            }
            catch (Exception ex)
            {
                // Log the exception details in case of an error during the deletion process
                _logger.LogError(ex, $"Error occurred while deleting flow version with FlowVersionId {flowVersionId}");
            }

            // Return the final response
            return serviceResponse;
        }

        // Deletes multiple flow versions from the database based on a list of flow version ids.
        public async Task<ServiceResponse<bool>> DeleteMultipleBlocksAsync(IEnumerable<Guid> flowVersionIds)
        {
            var serviceResponse = new ServiceResponse<bool>
            {
                Data = false,
                Message = "Failed to delete flow versions. Please try again."
            };

            // If the list of flowVersionIds is null or empty, return an error response.
            if (flowVersionIds == null || !flowVersionIds.Any())
            {
                serviceResponse.Message = "No flow versions provided to delete. Please provide valid flow version IDs.";
                return serviceResponse;
            }

            try
            {
                // Fetch flow versions that belong to the current user and are part of the provided list of ids.
                var flowVersionsToDelete = await _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w => flowVersionIds.Contains(w.Id) && w.CreatedByUserId == _userId)
                    .ToListAsync();

                // If no matching flow versions are found, return a message indicating nothing was deleted.
                if (flowVersionsToDelete.Count == 0)
                {
                    serviceResponse.Message = "No flow versions found for the provided IDs or they are not owned by the current user.";
                    return serviceResponse;
                }

                // Delete all the matching flow versions
                _unitOfWork.FlowVersionRepo.Delete(flowVersionsToDelete);

                // Attempt to save the changes to the database
                if (!await _unitOfWork.SaveAsync())
                {
                    _logger.LogWarning("Failed to save deletion of multiple flow versions.");
                    return serviceResponse;
                }

                // Return a success message and set the response data to true indicating success
                serviceResponse.Data = true;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = $"Successfully deleted {flowVersionsToDelete.Count} flow versions.";

                // Log the successful deletion
                _logger.LogInformation($"Successfully deleted {flowVersionsToDelete.Count} flow versions with IDs: {string.Join(", ", flowVersionIds)}.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while deleting multiple flow versions.");
            }

            // Return the final service response
            return serviceResponse;
        }

        // Searches for flow versions based on a search key and optional flow ID.
        public async Task<ServiceResponse<IEnumerable<SearchBlockDto>>> SearchBlocksAsync(string searchKey, Guid? flowId)
        {
            var serviceResponse = new ServiceResponse<IEnumerable<SearchBlockDto>>
            {
                Data = null,
                Message = "Failed to search for blocks. Please try again."
            };

            // If the search key is empty or null, return a message indicating the issue.
            if (string.IsNullOrWhiteSpace(searchKey))
            {
                serviceResponse.Message = "Search keyword cannot be empty. Please provide a valid search keywords.";
                return serviceResponse;
            }

            try
            {
                // Build the query to search flow versions, filtering by flowId, published status, and archived status
                var flowVersionsQuery = _unitOfWork.FlowVersionRepo
                    .GetByConditionAsync(w =>
                        (!flowId.HasValue || w.FlowId == flowId) &&
                        w.IsPublished &&
                        !w.IsArchived &&
                        w.Flow.Type == FlowTypesEnum.Block &&
                        w.Flow.Name.ToLower().Contains(searchKey.ToLower())
                    );

                // Execute the query and map the result to SearchBlockDto
                var flowVersions = await flowVersionsQuery
                    .Include(i => i.Flow)
                    .ProjectToType<SearchBlockDto>()
                    .ToListAsync();

                serviceResponse.Data = flowVersions;
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "Block retrived Successfully.";

                _logger.LogInformation($"Successfully retrieved {flowVersions.Count()} blocks for search key: {searchKey}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error occurred while searching for blocks with key: {searchKey}");
            }

            return serviceResponse;
        }
    }
}

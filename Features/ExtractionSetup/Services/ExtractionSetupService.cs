namespace MLModelBuilderAPIs.Services;

public class ExtractionSetupService : IExtractionSetupService
{
    private readonly ILogger<ExtractionSetupService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public ExtractionSetupService(
        ILogger<ExtractionSetupService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Retrieve the user ID from the HTTP context and initialize the logger and unit of work
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all extraction setups created by the user
    public async Task<ServiceResponse<IEnumerable<ExtractionSetupDto>>> RetrieveAllExtractionSetupsAsync()
    {
        // Initialize the service response with a failure message and null data.
        var serviceResponse = new ServiceResponse<IEnumerable<ExtractionSetupDto>>
        {
            Data = null,
            Message = "Failed to retrieve extraction setups. Please try again."
        };

        try
        {
            // Log the attempt to fetch extraction setups for the user.
            _logger.LogInformation($"Initiating retrieval of extraction setups for user: {_userId}");

            // Fetch extraction setups associated with the user, ordered by creation date.
            var extractionSetups = await _unitOfWork.ExtractionSetupRepo
                .GetByConditionAsync(w => w.CreatedByUserId == _userId)
                .ProjectToType<ExtractionSetupDto>()
                .ToListAsync();

            // Log the successful retrieval of extraction setups, including the count retrieved.
            _logger.LogInformation($"Successfully retrieved {extractionSetups.Count} extraction setups for user: {_userId}");

            // Assign the retrieved extraction setups to the service response's data property.
            serviceResponse.Data = extractionSetups.Adapt<IEnumerable<ExtractionSetupDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setups retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"An error occurred while retrieving extraction setups for user: {_userId}. Exception: {ex.Message}");
        }

        // Return the service response.
        return serviceResponse;
    }

    // Creates a new extraction setup record
    public async Task<ServiceResponse<ExtractionSetupDto>> InsertExtractionSetupAsync(ExtractionSetupDto extractionSetupDto)
    {
        // Initialize the service response with a failure message and null data.
        var serviceResponse = new ServiceResponse<ExtractionSetupDto>
        {
            Data = null,
            Message = "Failed to add extraction setup. Please try again."
        };

        try
        {
            // TODO: Check if an extraction setup with the same name already exists
            // Log the attempt to add a new extraction setup.
            _logger.LogInformation($"Attempting to add a new extraction setup for user: {_userId}");

            // Clean and trim any unnecessary spaces from string properties in the DTO before processing.
            extractionSetupDto = TrimDtoStringPropsUtil.TrimDtoStringProps(extractionSetupDto);

            // Map the cleaned DTO to the extraction setup entity.
            var newExtractionSetup = extractionSetupDto.Adapt<ExtractionSetup>();

            // Set the user IDs for creation and modification to the current user.
            newExtractionSetup.CreatedByUserId = _userId;
            newExtractionSetup.LastModifiedByUserId = _userId;

            // Insert the new extraction setup into the repository.
            _logger.LogInformation($"Inserting new extraction setup into the database for user: {_userId}");
            await _unitOfWork.ExtractionSetupRepo.InsertAsync(newExtractionSetup);

            // Save the changes to the database and check if the operation is successful.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to save the new extraction setup for user: {_userId}");
                return serviceResponse;
            }

            // Log successful insertion and saving of the extraction setup.
            _logger.LogInformation($"New extraction setup successfully added for user: {_userId}");

            // Return a success response with the newly created extraction setup.
            serviceResponse.Data = newExtractionSetup.Adapt<ExtractionSetupDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup added successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"An error occurred while adding the extraction setup for user: {_userId}. Exception: {ex.Message}");
        }

        // Return the service response.
        return serviceResponse;
    }

    // Update an existing extraction setup record
    public async Task<ServiceResponse<ExtractionSetupDto>> UpdateExtractionSetupAsync(ExtractionSetupDto extractionSetupDto)
    {
        // Initialize the service response with a failure message and null data.
        var serviceResponse = new ServiceResponse<ExtractionSetupDto>
        {
            Data = null,
            Message = "Failed to update extraction setup. Please try again."
        };

        try
        {
            // Log the initiation of the update process for the extraction setup.
            _logger.LogInformation($"Initiating update for extraction setup with ID: {extractionSetupDto.Id} for user: {_userId}");

            // Retrieve the existing extraction setup by its ID from the repository.
            var extractionSetup = await _unitOfWork.ExtractionSetupRepo
                .GetByConditionAsync(w => w.Id == extractionSetupDto.Id)
                .SingleOrDefaultAsync();

            // If the extraction setup is not found, log a warning and return a response indicating the setup doesn't exist.
            if (extractionSetup == null)
            {
                _logger.LogWarning($"No extraction setup found with ID {extractionSetupDto.Id} for user: {_userId}");
                serviceResponse.Message = "Extraction setup not found";
                return serviceResponse;
            }

            // TODO: Add logic to check if another extraction setup with the same name already exists.

            // Clean and trim string properties in the DTO to avoid any unnecessary spaces or unwanted characters.
            extractionSetupDto = TrimDtoStringPropsUtil.TrimDtoStringProps(extractionSetupDto);

            // Map the updated DTO values to the existing extraction setup entity.
            var updatedExtractionSetup = extractionSetupDto.Adapt(extractionSetup);

            // Set the user ID of the person modifying the extraction setup.
            updatedExtractionSetup.LastModifiedByUserId = _userId;

            // Update the extraction setup in the repository with the new values.
            _unitOfWork.ExtractionSetupRepo.Update(updatedExtractionSetup);

            // Save the changes to the database. If unsuccessful, log the error and return the response.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to persist updated extraction setup for user: {_userId}");
                return serviceResponse;
            }

            // Log the success of the update operation.
            _logger.LogInformation($"Extraction setup with ID {extractionSetupDto.Id} successfully updated for user: {_userId}");

            // Return the updated extraction setup data in the service response.
            serviceResponse.Data = updatedExtractionSetup.Adapt<ExtractionSetupDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"An error occurred while updating the extraction setup for user: {_userId}. Exception: {ex.Message}");
        }

        // Return the service response.
        return serviceResponse;
    }

    // Delete an extraction setup record
    public async Task<ServiceResponse<bool>> RemoveExtractionSetupAsync(Guid extractionSetupId)
    {
        // Initialize the service response with default failure values
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete extraction setup. Please try again."
        };

        try
        {
            // Log the start of the deletion process
            _logger.LogInformation($"Attempting to delete extraction setup with ID: {extractionSetupId} for user: {_userId}");

            // Attempt to retrieve the extraction setup by ID
            var extractionSetup = await _unitOfWork.ExtractionSetupRepo
                .GetByConditionAsync(w => w.Id == extractionSetupId)
                .SingleOrDefaultAsync();

            // If not found, log a warning and return an appropriate message
            if (extractionSetup == null)
            {
                _logger.LogWarning($"Extraction setup with ID {extractionSetupId} not found for user: {_userId}");
                serviceResponse.Message = "Extraction setup does not exist.";
                return serviceResponse;
            }

            // Proceed to delete the found extraction setup
            _logger.LogInformation($"Deleting extraction setup with ID: {extractionSetupId} for user: {_userId}");
            _unitOfWork.ExtractionSetupRepo.Delete(extractionSetup);

            // Attempt to persist the deletion in the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to delete extraction setup with ID {extractionSetupId} for user: {_userId} during save.");
                return serviceResponse;
            }

            // Log successful deletion
            _logger.LogInformation($"Successfully deleted extraction setup with ID {extractionSetupId} for user: {_userId}");

            // Update service response to reflect success
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error occurred while deleting extraction setup with ID {extractionSetupId} for user: {_userId}. Exception: {ex.Message}");
        }

        // Return the final service response
        return serviceResponse;
    }

    // Delete multiple extraction setup records
    public async Task<ServiceResponse<bool>> RemoveMultipleExtractionSetupAsync(IEnumerable<Guid> extractionSetupIds)
    {
        // Initialize the service response with default failure values
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete extraction setups. Please try again."
        };

        try
        {
            // Log the start of the batch deletion process
            _logger.LogInformation($"Attempting to delete {extractionSetupIds.Count()} extraction setups for user: {_userId}");

            // Retrieve all extraction setups that match the provided IDs
            var extractionSetups = await _unitOfWork.ExtractionSetupRepo
                .GetByConditionAsync(w => extractionSetupIds.Contains(w.Id))
                .ToListAsync();

            // If none of the requested setups were found, return early
            if (!extractionSetups.Any())
            {
                serviceResponse.Message = "No extraction setups were found to delete.";
                return serviceResponse;
            }

            // Delete the found extraction setups
            _unitOfWork.ExtractionSetupRepo.Delete(extractionSetups);

            // Attempt to save the changes
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError($"Failed to delete extraction setups for user: {_userId} during save.");
                return serviceResponse;
            }

            // Log successful deletion
            _logger.LogInformation($"Successfully deleted {extractionSetups.Count} extraction setups for user: {_userId}");

            // Set success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setups deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"An error occurred while deleting multiple extraction setups for user: {_userId}. Exception: {ex.Message}");
        }

        return serviceResponse;
    }

    // Retrieves an extraction setup by its identifier
    public async Task<ServiceResponse<ExtractionSetupDto>> RetrieveExtractionSetupByIdAsync(Guid extractionSetupId)
    {
        // Initialize the service response with a default failure message and null data
        var serviceResponse = new ServiceResponse<ExtractionSetupDto>
        {
            Data = null,
            Message = "Failed to retrieve extraction setup. Please try again."
        };

        try
        {
            // Log the start of the retrieval process
            _logger.LogInformation($"Attempting to retrieve extraction setup with ID: {extractionSetupId}");

            // Attempt to fetch the extraction setup by ID and map it to a DTO
            var extractionSetup = await _unitOfWork.ExtractionSetupRepo
                .GetByConditionAsync(w => w.Id == extractionSetupId)
                .ProjectToType<ExtractionSetupDto>()
                .SingleOrDefaultAsync();

            // If the setup is not found, log a warning and return an appropriate message
            if (extractionSetup == null)
            {
                _logger.LogWarning($"Extraction setup with ID {extractionSetupId} not found");
                serviceResponse.Message = "Extraction setup does not exist.";
                return serviceResponse;
            }

            // Log successful retrieval
            _logger.LogInformation($"Extraction setup with ID {extractionSetupId} retrieved successfully");

            // Populate the successful response
            serviceResponse.Data = extractionSetup;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error retrieving extraction setup with ID {extractionSetupId}. Exception: {ex.Message}");
        }

        // Return the final service response
        return serviceResponse;
    }
}

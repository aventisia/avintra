
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

    //Retrieves all extraction setups created by the user
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
                .Include(i => i.MLModel)
                .Include(i => i.TableMetadata!)
                    .ThenInclude(i1 => i1.TableHeaders)
                .Include(i => i.FieldSetups)
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

    //Initialize a new extraction setup record
    public string CreateSerializedExtractionSetup()
    {
        // Define the default prompt for extraction logic
        var defaultPrompt = "You are an expert extraction algorithm.\n" +
                           "Only extract relevant information from the text.\n" +
                           "If you do not know the value of an attribute asked to extract, you may omit the attribute's value.";

        // Construct a default extraction setup
        var defaultExtractionSetup = new ExtractionSetupDto
        {
            DocumentContext = string.Empty,
            NodePrompt = defaultPrompt,
            TableMetadata = null,
            FieldSetups = new List<FieldSetupDto>
            {
                new FieldSetupDto
                {
                    Name = string.Empty,
                    Type = string.Empty,
                    Instructions = string.Empty
                }
            }
        };

        // Serialize the setup to a JSON string
        return JsonConvert.SerializeObject(defaultExtractionSetup);
    }

    // Creates a new extraction setup record
    public async Task<ServiceResponse<ExtractionSetupDto>> InsertExtractionSetupAsync(ExtractionSetupDto extractionSetupDto)
    {
        // Initialize the response with a default failure message.
        var serviceResponse = new ServiceResponse<ExtractionSetupDto>
        {
            Data = null,
            Message = "Failed to add extraction setup. Please try again.",
        };

        try
        {
            _logger.LogInformation("User [{UserId}] is attempting to create a new extraction setup.", _userId);

            // Check if an extraction setup already exists for the given MLModelId
            var extractionSetup = await _unitOfWork.ExtractionSetupRepo
                .GetByConditionAsync(w => w.MLModelId == extractionSetupDto.MLModelId)
                .Include(i => i.MLModel)
                .FirstOrDefaultAsync();

            if (extractionSetup != null)
            {
                // Log that an extraction setup already exists and return a relevant message
                _logger.LogInformation("An extraction setup already exists for ML model ID: {MLModelId}.", extractionSetupDto.MLModelId);

                // Update the service response message to inform the user
                serviceResponse.Message = $"An extraction setup already exists for ML model Name: {extractionSetup.MLModel.Name}.";
                return serviceResponse;
            }

            // Trim and sanitize all string properties in the DTO.
            extractionSetupDto = TrimDtoStringPropsUtil.TrimDtoStringProps(extractionSetupDto);

            // Map the DTO to the entity model.
            var extractionSetupEntity = extractionSetupDto.Adapt<ExtractionSetup>();

            // Set audit fields
            extractionSetupEntity.CreatedByUserId = _userId;
            extractionSetupEntity.LastModifiedByUserId = _userId;

            // Map nested table metadata if any exist.
            if (extractionSetupDto.TableMetadata.Any())
            {
                extractionSetupEntity.TableMetadata = extractionSetupDto.TableMetadata.Select(s => new TableMetadata
                {
                    Name = s.Name,
                    Context = s.Context,
                    TableHeaders = s.TableHeaders.Select(s1 => new TableHeader
                    {
                        Name = s1.Name,
                        Type = s1.Type,
                        Instructions = s1.Instructions
                    }).ToList()
                }).ToList();
            }

            // Map field setups if any exist.
            if (extractionSetupDto.FieldSetups.Any())
            {
                extractionSetupEntity.FieldSetups = extractionSetupDto.FieldSetups.Select(field => new FieldSetup
                {
                    Name = field.Name,
                    Type = field.Type,
                    Instructions = field.Instructions
                }).ToList();
            }

            _logger.LogInformation("Inserting extraction setup into the database for user [{UserId}].", _userId);

            // Insert the new extraction setup
            await _unitOfWork.ExtractionSetupRepo.InsertAsync(extractionSetupEntity);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Database save failed while creating extraction setup for user [{UserId}].", _userId);
                return serviceResponse;
            }

            // Successfully saved; map back to DTO and update response
            serviceResponse.Data = extractionSetupEntity.Adapt<ExtractionSetupDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup added successfully.";

            _logger.LogInformation("Extraction setup created successfully for user [{UserId}].", _userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An unexpected error occurred while creating extraction setup for user [{UserId}].", _userId);
        }

        return serviceResponse;
    }

    // Method to update an existing extraction setup record
    public async Task<ServiceResponse<MLModelSetupDto>> UpdateExtractionSetupAsync(MLModelSetupDto mLModelSetupDto)
    {
        // Initialize the service response with a failure state and default message
        var serviceResponse = new ServiceResponse<MLModelSetupDto>
        {
            Data = null,
            Message = "Failed to update extraction setup. Please try again later."
        };

        try
        {
            // Log the start of the update operation, including the relevant identifiers
            _logger.LogInformation("Update process initiated | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);

            // Retrieve the existing extraction setup from the database by ID
            var mLModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mLModelSetupDto.Id)
                .SingleOrDefaultAsync();

            // Check if the setup was not found and return an appropriate message
            if (mLModel == null)
            {
                _logger.LogWarning("Extraction setup not found | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);
                serviceResponse.Message = "Extraction setup not found. The provided setup ID does not exist.";
                return serviceResponse;
            }

            // Trim any unnecessary spaces or formatting from string fields in the DTO
            mLModelSetupDto = TrimDtoStringPropsUtil.TrimDtoStringProps(mLModelSetupDto);

            // Log the mapping process from DTO to entity
            mLModelSetupDto.Adapt(mLModel);
            mLModel.LastModifiedByUserId = _userId;

            // Log the action of saving changes to the database
            _logger.LogInformation("Saving the updated extraction setup to the database | ML Model Setup ID: {Id}", mLModelSetupDto.Id);
            _unitOfWork.MLModelRepo.Update(mLModel);

            // Attempt to persist the changes and check for success
            if (!await _unitOfWork.SaveAsync())
            {
                // Log an error if the database save operation fails
                _logger.LogError("Failed to save changes to the database | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);
                return serviceResponse;
            }

            // Log success upon successful update
            _logger.LogInformation("Extraction setup update completed successfully | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);

            // Set the response data with the updated DTO and indicate successful completion
            serviceResponse.Data = mLModel.Adapt<MLModelSetupDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup updated successfully.";
        }
        catch (Exception ex)
        {
            // Log any exception that occurs during the process
            _logger.LogError(ex, "Exception occurred during extraction setup update | ML Model Setup ID: {Id} | User ID: {UserId}", mLModelSetupDto.Id, _userId);
        }

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
                .Include(i => i.MLModel)
                .Include(i => i.TableMetadata!)
                    .ThenInclude(i1 => i1.TableHeaders)
                .Include(i => i.FieldSetups)
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

    public async Task<ServiceResponse<MLModelSetupDto>> GetExtractionSetupByMLModelIdAsync(Guid mlModelId)
    {
        // Initialize the response with a default failure message and null data
        var serviceResponse = new ServiceResponse<MLModelSetupDto>
        {
            Data = null,
            Message = "Failed to retrieve the extraction setup. Please try again later."
        };

        try
        {
            // Log the beginning of the retrieval process
            _logger.LogInformation("Attempting to retrieve extraction setup for ML model with ID: {MLModelId}", mlModelId);

            // Fetch the extraction setup based on the provided ML model ID and map it to the DTO
            var mLModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(w => w.Id == mlModelId)
                .Include(i => i.CreatedByUser)
                .SingleOrDefaultAsync();

            // If no setup is found, log a warning and return a message
            if (mLModel == null)
            {
                _logger.LogWarning("No extraction setup found for ML model with ID: {MLModelId}", mlModelId);
                serviceResponse.Message = "No extraction setup exists for the provided ML model ID.";
                return serviceResponse;
            }

            // Log the successful retrieval of the setup
            _logger.LogInformation("Successfully retrieved extraction setup for ML model with ID: {MLModelId}", mlModelId);

            // Set the successful response data
            serviceResponse.Data = mLModel.Adapt<MLModelSetupDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extraction setup retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError("Error occurred while retrieving extraction setup for ML model with ID: {MLModelId}. Exception: {ExceptionMessage}", mlModelId, ex.Message);
        }

        return serviceResponse;
    }
}

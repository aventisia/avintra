namespace MLModelBuilderAPIs.Services;

public class ExtractedDataService : IExtractedDataService
{
    #region Fields
    private readonly ILogger<ExtractedDataService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    #endregion

    #region Constructors
    public ExtractedDataService(
        ILogger<ExtractedDataService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId from the HTTP context, extracted from the user claims
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());
        _logger = logger;
        _unitOfWork = unitOfWork;
    }
    #endregion

    #region Methods

    // Get the list of extracted data for a specific AI project version
    public async Task<ServiceResponse<IEnumerable<ExtractedDataDto>>> GetExtractedDataListAsync(Guid aiProjectVersionId)
    {
        // Initialize the response with a failure default
        var serviceResponse = new ServiceResponse<IEnumerable<ExtractedDataDto>>()
        {
            Data = null,
            Message = "Failed to retrieve extracted data. Please try again."
        };

        try
        {
            // Retrieve the list of extracted data associated with the given AI project version ID
            var extractedData = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(w => w.AIProjectVersionId == aiProjectVersionId)
                .Include(i => i.CreatedByUser)
                .OrderByDescending(ml => ml.CreatedOn)
                .ProjectToType<ExtractedDataDto>()
                .ToListAsync();

            // If data retrieval is successful, update the service response
            serviceResponse.Data = extractedData;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted data retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in GetExtractedDataListAsync: {ex.Message}");
        }

        return serviceResponse;
    }

    // Inserts a new extracted data entry
    public async Task<ServiceResponse<ExtractedDataDto>> InsertExtractedDataAsync(ExtractedDataDto extractedDataDto)
    {
        // Initialize the response with a failure default
        var serviceResponse = new ServiceResponse<ExtractedDataDto>()
        {
            Data = null,
            Message = "Failed to add extracted data. Please try again."
        };

        try
        {
            // Map DTO to entity, and set user IDs for the created and modified data
            var newData = extractedDataDto.Adapt<ExtractedData>();
            newData.CreatedByUserId = _userId;
            newData.LastModifiedByUserId = _userId;

            // Insert the new extracted data into the repository
            await _unitOfWork.ExtractedDataRepo.InsertAsync(newData);

            // Attempt to save changes to the context
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save extracted data after insertion.");
                return serviceResponse;
            }

            // On successful insertion, set success response
            serviceResponse.Data = newData.Adapt<ExtractedDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted data added successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in InsertExtractedDataAsync: {ex.Message}");
        }

        return serviceResponse;
    }

    // Updates an existing extracted data entry
    public async Task<ServiceResponse<ExtractedDataDto>> UpdateExtractedDataAsync(ExtractedDataDto extractedDataDto)
    {
        // Initialize the response with a failure default
        var serviceResponse = new ServiceResponse<ExtractedDataDto>()
        {
            Data = null,
            Message = "Failed to update extracted data. Please ty again"
        };

        try
        {
            // Validate if the data exists in the repository
            var data = await _unitOfWork.ExtractedDataRepo
                        .GetByConditionAsync(w => w.Id == extractedDataDto.Id ||
                          (w.AIProjectVersionId == extractedDataDto.MLModelId && w.VersionResourceId == extractedDataDto.DocId))
                        .SingleOrDefaultAsync();

            if (data == null)
            {
                _logger.LogInformation("Data does not exist in the database");
                serviceResponse.Message = "Data does not exist";
                return serviceResponse;
            }

            // Auto-map the DTO to the existing data and set user IDs for modified data
            var newData = extractedDataDto.Adapt(data);
            newData.CreatedByUserId = _userId;
            newData.LastModifiedByUserId = _userId;

            // Update the repository with the modified data
            _unitOfWork.ExtractedDataRepo.Update(newData);

            // Attempt to save the changes to the context
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating the extracted data");
                return serviceResponse;
            }

            // On successful update, set success response
            serviceResponse.Data = newData.Adapt<ExtractedDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted data updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in UpdateExtractedDataAsync: {ex.Message}");
        }

        return serviceResponse;
    }

    // Deletes an extracted data entry
    public async Task<ServiceResponse<bool>> DeleteExtractedDataAsync(Guid id)
    {
        // Initialize the response with a failure default
        var serviceResponse = new ServiceResponse<bool>()
        {
            Data = false,
            Message = "Failed to delete extracted data. Please try agaim."
        };

        try
        {
            // Retrieve the data entry to be deleted
            var data = await _unitOfWork.ExtractedDataRepo
            .GetByConditionAsync(w => w.Id == id)
            .Include(i => i.VersionResource)
            .SingleOrDefaultAsync();

            if (data == null)
            {
                _logger.LogInformation("Data does not exist for deletion");
                serviceResponse.Message = "Data does not exist";
                return serviceResponse;
            }

            // Delete the extracted data and associated version resource if present
            _unitOfWork.ExtractedDataRepo.Delete(data);
            if (data.VersionResource != null)
            {
                _unitOfWork.VersionResourceRepo.Delete(data.VersionResource);
            }

            // Attempt to save changes to the context
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while deleting the extracted data");
                return serviceResponse;
            }

            // On successful deletion, set success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Data deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in DeleteExtractedDataAsync: {ex.Message}");
        }

        return serviceResponse;
    }

    // Get an extracted data entry by ID
    public async Task<ServiceResponse<ExtractedDataDto>> GetExtractedDataByIdAsync(Guid id)
    {
        // Initialize the response with a failure default
        var serviceResponse = new ServiceResponse<ExtractedDataDto>()
        {
            Data = null,
            Message = "Failed to retrieve extracted data. Please try again."
        };

        try
        {
            // Retrieve data by ID
            var data = await _unitOfWork.ExtractedDataRepo
            .GetByConditionAsync(w => w.Id == id)
            .Include(i => i.CreatedByUser)
            .SingleOrDefaultAsync();

            if (data == null)
            {
                _logger.LogInformation("Data does not exist for the given ID");
                serviceResponse.Message = "Data does not exist";
                return serviceResponse;
            }

            // On successful retrieval, set the data and response message
            serviceResponse.Data = data.Adapt<ExtractedDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Data retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in GetExtractedDataByIdAsync: {ex.Message}");
        }

        return serviceResponse;
    }

    // Updates an extracted data entry silently without triggering notifications or side effects
    public async Task<ServiceResponse<bool>> UpdateExtractedDataSilentlyAsync(ExtractedDataSilentUpdateDataDto silentUpdateDataDto)
    {
        // Initialize the response with a failure default
        var serviceResponse = new ServiceResponse<bool>()
        {
            Data = false,
            Message = "Failed to update extracted data. Please try again later."
        };

        try
        {
            // Trim any string properties in the DTO for clean data
            silentUpdateDataDto = TrimDtoStringPropsUtil.TrimDtoStringProps(silentUpdateDataDto);

            // Check if the extracted data exists
            var existingExtractedData = await _unitOfWork.ExtractedDataRepo
                        .GetByConditionAsync(w => w.Id == silentUpdateDataDto.Id ||
                          (w.AIProjectVersionId == silentUpdateDataDto.MLModelId && w.VersionResourceId == silentUpdateDataDto.DocId))
                        .SingleOrDefaultAsync();

            if (existingExtractedData == null)
            {
                _logger.LogInformation("No extracted data found for the given ID");
                serviceResponse.Message = "Extracted data not found.";
                return serviceResponse;
            }

            // Update the extracted data with new values from the DTO
            existingExtractedData.DataObject = silentUpdateDataDto.DataObject;
            existingExtractedData.SubmitForFineTuning = silentUpdateDataDto.SubmitForFineTuning;
            existingExtractedData.CreatedByUserId = _userId;
            existingExtractedData.LastModifiedByUserId = _userId;

            // Apply the changes to the repository
            _unitOfWork.ExtractedDataRepo.Update(existingExtractedData);

            // Attempt to save changes to the context
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes while updating extracted data silently");
                return serviceResponse;
            }

            // On successful update, set success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted data updated successfully.";
        }
        catch (Exception exception)
        {
            _logger.LogError($"Error in UpdateExtractedDataSilentlyAsync: {exception.Message}");
        }

        return serviceResponse;
    }

    // Deletes multiple extracted data entries based on the provided list of IDs
    public async Task<ServiceResponse<bool>> DeleteMultipleExtractedDataAsync([FromBody] List<Guid> ids)
    {
        // Initialize the response with a failure default
        var serviceResponse = new ServiceResponse<bool>()
        {
            Data = false,
            Message = "Failed to delete extracted data. Please try again later."
        };

        try
        {
            // Retrieve a list of extracted data based on the provided IDs
            var extractedDataList = await _unitOfWork.ExtractedDataRepo
                                                    .GetByConditionAsync(w => ids.Contains(w.Id))
                                                    .Include(i => i.VersionResource)
                                                    .ToListAsync();

            // If no matching data found, return failure
            if (extractedDataList.Count == 0)
            {
                _logger.LogInformation("No matching extracted data found for the given IDs");
                serviceResponse.Message = "No extracted data found with the specified IDs.";
                return serviceResponse;
            }

            // Loop through the list of extracted data and delete each entry
            foreach (var data in extractedDataList)
            {
                _unitOfWork.ExtractedDataRepo.Delete(data);
                if (data.VersionResource != null)
                {
                    _unitOfWork.VersionResourceRepo.Delete(data.VersionResource);
                }
            }

            // Attempt to save the changes to the context
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes while deleting extracted data items.");
                return serviceResponse;
            }

            // On successful deletion, set success response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{ids.Count} extracted data items deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error in DeleteMultipleExtractedDataAsync: {ex.Message}");
        }

        return serviceResponse;
    }

    #endregion
}

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
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    #endregion

    #region Methods

    // Get the list extracted data of a specific ML model
    public async Task<ServiceResponse<IEnumerable<ExtractedDataDto>>> GetExtractedDataListAsync(Guid mlModelId, ExtractedDataType type)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<ExtractedDataDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get extracted data
            var extractedData = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(d => d.MLModelId == mlModelId && d.Type == type).Include(c => c.CreatedByUser)
                .OrderByDescending(ml => ml.CreatedOn)
                .ProjectToType<ExtractedDataDto>()
                .ToListAsync();

            // Task successful
            serviceResponse.Data = extractedData;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted data retrieved successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Inserts an extracted data
    public async Task<ServiceResponse<ExtractedDataDto>> InsertExtractedDataAsync(ExtractedDataDto extractedDataDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ExtractedDataDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Default mapping
            var newData = extractedDataDto.Adapt<ExtractedData>();
            newData.CreatedByUserId = _userId;
            newData.LastModifiedByUserId = _userId;

            //Insert an extracted data 
            await _unitOfWork.ExtractedDataRepo.InsertAsync(newData);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting an extracted data.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newData.Adapt<ExtractedDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted data added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates an extracted data
    public async Task<ServiceResponse<ExtractedDataDto>> UpdateExtractedDataAsync(ExtractedDataDto extractedDataDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ExtractedDataDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate data existence
            var data = await _unitOfWork.ExtractedDataRepo
                        .GetByConditionAsync(w => w.Id == extractedDataDto.Id ||
                          (w.MLModelId == extractedDataDto.MLModelId && w.DocId == extractedDataDto.DocId))
                        .SingleOrDefaultAsync();

            // data does not exist
            if (data == null)
            {
                _logger.LogInformation($"Data does not exist");
                serviceResponse.Message = "Data does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newData = extractedDataDto.Adapt(data);
            newData.CreatedByUserId = _userId;
            newData.LastModifiedByUserId = _userId;

            //Updates to new data
            _unitOfWork.ExtractedDataRepo.Update(newData);


            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating an extracted data");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newData.Adapt<ExtractedDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted data updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Deletes an extracted data
    public async Task<ServiceResponse<bool>> DeleteExtractedDataAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get a existing data using identifier
            var data = await _unitOfWork.ExtractedDataRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if data not exists
            if (data == null)
            {
                _logger.LogInformation($"Data does not exist");
                serviceResponse.Message = "Data does not exist";
                return serviceResponse;
            }

            //Delete data permonently
            _unitOfWork.ExtractedDataRepo.Delete(data);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting an extracted data.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Data deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Get an extracted data by identifier
    public async Task<ServiceResponse<ExtractedDataDto>> GetExtractedDataByIdAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<ExtractedDataDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get data using identifier
            var data = await _unitOfWork.ExtractedDataRepo
            .GetByConditionAsync(v => v.Id == id).Include(c => c.CreatedByUser)
            .SingleOrDefaultAsync();

            //Check if data not exists
            if (data == null)
            {
                _logger.LogInformation($"Data does not exist");
                serviceResponse.Message = "Data does not exist";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = data.Adapt<ExtractedDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Data retrieved successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Updates an extracted data record without triggering notifications or other side effects
    public async Task<ServiceResponse<bool>> UpdateExtractedDataSilentlyAsync(ExtractedDataSilentUpdateDataDto silentUpdateDataDto)
    {
        // Initialize the service response with a failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Message = "Failed to update extracted data. Please try again later."
        };

        try
        {
            // Trim any string properties in the DTO to ensure clean data
            silentUpdateDataDto = TrimDtoStringPropsUtil.TrimDtoStringProps(silentUpdateDataDto);

            // Check if the extracted data exists in the repository
            var existingExtractedData = await _unitOfWork.ExtractedDataRepo
                        .GetByConditionAsync(w => w.Id == silentUpdateDataDto.Id ||
                          (w.MLModelId == silentUpdateDataDto.MLModelId && w.DocId == silentUpdateDataDto.DocId))
                        .SingleOrDefaultAsync();

            // If the extracted data doesn't exist, return a failure response
            if (existingExtractedData == null)
            {
                _logger.LogInformation("No extracted data found with the provided ID.");
                serviceResponse.Message = "Extracted data not found.";
                return serviceResponse;
            }

            // Update the extracted data with the new values from the DTO
            existingExtractedData.DataObject = silentUpdateDataDto.DataObject;
            existingExtractedData.SubmitForFineTuning = silentUpdateDataDto.SubmitForFineTuning;
            existingExtractedData.CreatedByUserId = _userId;
            existingExtractedData.LastModifiedByUserId = _userId;

            // Apply the changes to the repository
            _unitOfWork.ExtractedDataRepo.Update(existingExtractedData);

            // Attempt to save the changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Failed to save changes to the extracted data record.");
                return serviceResponse;
            }

            // If the update was successful, set the response with success details
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Extracted data updated successfully.";

        }
        catch (Exception exception)
        {
            _logger.LogError($"An error occurred while updating the extracted data: {exception.Message}");
        }

        return serviceResponse;
    }

    // Deletes multiple extracted data entries based on the provided list of IDs.
    public async Task<ServiceResponse<bool>> DeleteMultipleExtractedDataAsync([FromBody] List<Guid> ids)
    {
        // Initialize response with a failure state
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete extracted data. Please try again later."
        };

        try
        {
            // Retrieve the list of extracted data items matching the provided IDs
            var extractedDataList = await _unitOfWork.ExtractedDataRepo
                                                    .GetByConditionAsync(w => ids.Contains(w.Id))
                                                    .ToListAsync();

            // If no matching data found, return a message indicating no data was found
            if (extractedDataList.Count == 0)
            {
                _logger.LogInformation("No matching extracted data found for the given IDs.");
                serviceResponse.Message = "No extracted data found with the specified IDs.";
                return serviceResponse;
            }

            // TODO: Verify if there are any dependent entities or relationships tied to the extracted data

            // Perform the deletion of the matching extracted data items
            _unitOfWork.ExtractedDataRepo.Delete(extractedDataList);

            // Attempt to save changes to the database; if it fails, log an error and return failure
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError("Failed to save changes while deleting extracted data items.");
                return serviceResponse;
            }

            // If successful, update the response data and provide a success message
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{ids.Count} extracted data items deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError($"Error occurred while attempting to delete extracted data: {ex.Message}");
        }

        return serviceResponse;
    }
    #endregion

}

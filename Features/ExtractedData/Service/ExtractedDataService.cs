using Newtonsoft.Json;

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

            var extractedDataList = extractedData.Select(data =>
            {
                // Deserialize DataObject into a list of dynamic objects
                var deserializedData = JsonConvert.DeserializeObject<List<ExtractedFieldDto>>(data.DataObject);

                // Default mapping
                var finalData = data.Adapt<ExtractedDataDto>();

                // Initialize DynamicFields if it is null
                finalData.DynamicFields = finalData.DynamicFields ?? new Dictionary<string, string>();

                // Assuming each item in deserializedData contains key-value pairs
                if (deserializedData != null && deserializedData.Any())
                {
                    foreach (var item in deserializedData)
                    {
                        // Check the FieldName and Value directly, no need for Fields collection
                        if (!string.IsNullOrEmpty(item.FieldName) && item.Value != null)
                        {
                            // Adding dynamic fields to root-level DynamicFields
                            finalData.DynamicFields[item.FieldName] = item.Value.ToString();
                        }

                        // Add item to the ExtractedFieldList to maintain the original structure
                        finalData.ExtractedFieldList.Add(item.Adapt<ExtractedFieldDto>());
                    }

                }
                foreach (var dynamicField in finalData.DynamicFields)
                {
                    var propertyName = dynamicField.Key;
                    var propertyValue = dynamicField.Value;

                    // Dynamically add properties at the root level
                    finalData.GetType().GetProperty(propertyName)?.SetValue(finalData, propertyValue);
                }
                return finalData;

            }).ToList();

            // Task successful
            serviceResponse.Data = extractedDataList;
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
                .GetByConditionAsync(v => v.Id == extractedDataDto.Id)
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
            serviceResponse.Message = "Data retrived successfully";

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
                .GetByConditionAsync(record => record.Id == silentUpdateDataDto.Id)
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
    #endregion

}

namespace MLModelBuilderAPIs.Services;

public class DataFieldService : IDataFieldService
{
    #region Fields

    private readonly ILogger<DataFieldService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    #endregion

    #region  Constructors
    public DataFieldService(
        ILogger<DataFieldService> logger,
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

    // Retrieves list of data fields.
    public async Task<ServiceResponse<IEnumerable<DataFieldDto>>> GetDataFieldsAsync(Guid mlModelId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<DataFieldDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get data fields
            var fields = await _unitOfWork.DataFieldRepo
                        .GetByConditionAsync(w => w.MLModelId == mlModelId).Include(c => c.CreatedByUser)
                        .OrderBy(o => o.CreatedOn).ToListAsync();

            // Task successful
            serviceResponse.Data = fields.Adapt<IEnumerable<DataFieldDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Fields retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Checks the availability of a ml model name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsDataFieldNameAvailableAsync(CheckFieldNameAvailabilityDto checkFieldNameAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check data field name availability. Please try again"
        };

        try
        {
            // Validate field uniqueness
            var fieldAlreadyExists = await _unitOfWork.DataFieldRepo
                                                        .GetByConditionAsync(w =>
                                                            w.MLModelId == checkFieldNameAvailabilityDto.MLModelId &&
                                                            w.Name.ToLower() == checkFieldNameAvailabilityDto.UserInput.Trim().ToLower())
                                                        .FirstOrDefaultAsync();

            // Data field already exists
            if (fieldAlreadyExists != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A data field with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Field name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a new data field
    public async Task<ServiceResponse<DataFieldDto>> InsertDataFieldAsync(DataFieldDto dataFieldDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<DataFieldDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate field uniqueness
            var fieldAlreadyExists = await _unitOfWork.DataFieldRepo
                                                        .GetByConditionAsync(w =>
                                                            w.MLModelId == dataFieldDto.MLModelId &&
                                                            w.Name.ToLower() == dataFieldDto.Name.Trim().ToLower())
                                                        .FirstOrDefaultAsync();

            // field already exists
            if (fieldAlreadyExists != null)
            {
                _logger.LogInformation($"Field already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A Field with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto' string props
            dataFieldDto = TrimDtoStringPropsUtil.TrimDtoStringProps(dataFieldDto);

            // Default mapping
            var newField = dataFieldDto.Adapt<DataField>();
            newField.CreatedByUserId = _userId;
            newField.LastModifiedByUserId = _userId;

            //Insert a new field
            await _unitOfWork.DataFieldRepo.InsertAsync(newField);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting a data field.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newField.Adapt<DataFieldDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Data field added successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Updates a data field
    public async Task<ServiceResponse<DataFieldDto>> UpdateDataFieldAsync(DataFieldDto dataFieldDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<DataFieldDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate field uniqueness
            var fieldAlreadyExists = await _unitOfWork.DataFieldRepo
                                                        .GetByConditionAsync(w =>
                                                            w.MLModelId == dataFieldDto.MLModelId &&
                                                            w.Name.ToLower() == dataFieldDto.Name.Trim().ToLower()
                                                            && w.Id != dataFieldDto.Id)
                                                        .FirstOrDefaultAsync();

            // field already exists
            if (fieldAlreadyExists != null)
            {
                _logger.LogInformation($"Field already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A Field with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto' string props
            dataFieldDto = TrimDtoStringPropsUtil.TrimDtoStringProps(dataFieldDto);

            // Validate data field existence
            var field = await _unitOfWork.DataFieldRepo
                .GetByConditionAsync(v => v.Id == dataFieldDto.Id)
                .SingleOrDefaultAsync();

            // Data field does not exist
            if (field == null)
            {
                _logger.LogInformation($"Field does not exist");
                serviceResponse.Message = "Field does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newField = dataFieldDto.Adapt(field);
            newField.CreatedByUserId = _userId;
            newField.LastModifiedByUserId = _userId;

            //Update a data field
            _unitOfWork.DataFieldRepo.Update(newField);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating a field.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newField.Adapt<DataFieldDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Field updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Deletes a field
    public async Task<ServiceResponse<bool>> DeleteDataFieldAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get a data field using identifier
            var field = await _unitOfWork.DataFieldRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if field not exists
            if (field == null)
            {
                _logger.LogInformation($"Field does not exist");
                serviceResponse.Message = "Field does not exist";
                return serviceResponse;
            }

            //Delete a data field
            _unitOfWork.DataFieldRepo.Delete(field);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting a field.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Field deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Get a data field by identifier
    public async Task<ServiceResponse<DataFieldDto>> GetDataFieldByIdAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<DataFieldDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get a data field using identifier
            var field = await _unitOfWork.DataFieldRepo
            .GetByConditionAsync(v => v.Id == id).Include(c => c.CreatedByUser)
            .SingleOrDefaultAsync();

            //Check if field not exists
            if (field == null)
            {
                _logger.LogInformation($"Field does not exist");
                serviceResponse.Message = "Field does not exist";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = field.Adapt<DataFieldDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Field retrived successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    #endregion
}
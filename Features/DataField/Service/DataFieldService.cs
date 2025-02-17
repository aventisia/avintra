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
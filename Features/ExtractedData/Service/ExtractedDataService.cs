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
    public async Task<ServiceResponse<IEnumerable<ExtractedDataDto>>> GetExtractedDataListAsync(Guid mlModelId)
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
            var data = await _unitOfWork.ExtractedDataRepo
                .GetByConditionAsync(d => d.MLModelId == mlModelId)
                .OrderByDescending(ml => ml.CreatedOn).ToListAsync();

            // Task successful
            serviceResponse.Data = data.Adapt<IEnumerable<ExtractedDataDto>>();
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
            .GetByConditionAsync(v => v.Id == id)
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

    #endregion

}

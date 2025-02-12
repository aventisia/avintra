namespace MLModelBuilderAPIs.Services;

public class MLModelService : IMLModelService
{
    #region Fields
    private readonly ILogger<MLModelService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    #endregion

    #region Constructors

    public MLModelService(
        ILogger<MLModelService> logger,
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
    // Get the list of ML models
    public async Task<ServiceResponse<IEnumerable<MLModelDto>>> GetMLModelListAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<MLModelDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get ML model 
            var mlModels = await _unitOfWork.MLModelRepo
                .GetAllAsync().Include(c => c.CreatedByUser)
                .OrderByDescending(ml => ml.CreatedOn).ToListAsync();

            // Task successful
            serviceResponse.Data = mlModels.Adapt<IEnumerable<MLModelDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML Models retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Checks the availability of a ml model name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsMLModelNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check ML model name availability. Please try again"
        };

        try
        {
            // Validate model uniqueness
            var modelAlreadyExists = await _unitOfWork.MLModelRepo
                                                        .GetByConditionAsync(w =>
                                                            w.CreatedByUserId == _userId &&
                                                            w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                                                        .FirstOrDefaultAsync();

            // Model already exists
            if (modelAlreadyExists != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A model with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML Model name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a ML model
    public async Task<ServiceResponse<MLModelDto>> InsertMLModelAsync(MLModelDto mlModelDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MLModelDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate model uniqueness
            var modelAlreadyExists = await _unitOfWork.MLModelRepo
                                                        .GetByConditionAsync(w =>
                                                            w.CreatedByUserId == _userId &&
                                                            w.Name.ToLower() == mlModelDto.Name.Trim().ToLower())
                                                        .FirstOrDefaultAsync();

            // Model already exists
            if (modelAlreadyExists != null)
            {
                _logger.LogInformation($"Model already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A model with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto' string props
            mlModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(mlModelDto);

            // Default mapping
            var newMLModel = mlModelDto.Adapt<MLModel>();
            newMLModel.CreatedByUserId = _userId;
            newMLModel.LastModifiedByUserId = _userId;

            //Insert a ML model
            await _unitOfWork.MLModelRepo.InsertAsync(newMLModel);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting a ML Model.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newMLModel.Adapt<MLModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML Model added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates an ML model 
    public async Task<ServiceResponse<MLModelDto>> UpdateMLModelAsync(MLModelDto mlModelDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MLModelDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate ML model existence
            var mlModel = await _unitOfWork.MLModelRepo
                .GetByConditionAsync(v => v.Id == mlModelDto.Id)
                .SingleOrDefaultAsync();

            // ML model does not exist
            if (mlModel == null)
            {
                _logger.LogInformation($"ML model does not exist");
                serviceResponse.Message = "ML model does not exist";
                return serviceResponse;
            }

            // Validate model uniqueness
            var modelAlreadyExists = await _unitOfWork.MLModelRepo
                                                        .GetByConditionAsync(w =>
                                                            w.CreatedByUserId == _userId &&
                                                            w.Name.ToLower() == mlModelDto.Name.Trim().ToLower()
                                                            && w.Id != mlModelDto.Id)
                                                        .FirstOrDefaultAsync();

            // Model already exists
            if (modelAlreadyExists != null)
            {
                _logger.LogInformation($"Model already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A model with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto' string props
            mlModelDto = TrimDtoStringPropsUtil.TrimDtoStringProps(mlModelDto);

            // Auto mapping 
            var newMLModel = mlModelDto.Adapt(mlModel);
            newMLModel.CreatedByUserId = _userId;
            newMLModel.LastModifiedByUserId = _userId;

            //update a ML model
            _unitOfWork.MLModelRepo.Update(newMLModel);


            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating a ML Model.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newMLModel.Adapt<MLModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Deletes a ML model
    public async Task<ServiceResponse<bool>> DeleteMLModelAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get a ML model using identifier
            var mlModel = await _unitOfWork.MLModelRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if ML Model not exists
            if (mlModel == null)
            {
                _logger.LogInformation($"ML model does not exist");
                serviceResponse.Message = "ML model does not exist";
                return serviceResponse;
            }

            //Delete ML model
            _unitOfWork.MLModelRepo.Delete(mlModel);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting a ML Model");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML model deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Get a ML model by identifier
    public async Task<ServiceResponse<MLModelDto>> GetMLModelByIdAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<MLModelDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get a ML model using identifier
            var mlModel = await _unitOfWork.MLModelRepo
            .GetByConditionAsync(v => v.Id == id).Include(c => c.CreatedByUser)
            .SingleOrDefaultAsync();

            //Check if ML Model not exists
            if (mlModel == null)
            {
                _logger.LogInformation($"ML model does not exist");
                serviceResponse.Message = "ML model does not exist";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = mlModel.Adapt<MLModelDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "ML Model retrived successfully";

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

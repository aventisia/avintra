namespace MLModelBuilderAPIs.Services;

public class LLMService: ILLMService
{
     #region Fields

    private readonly ILogger<LLMService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    #endregion

    #region  Constructors
    public LLMService(
        ILogger<LLMService> logger,
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

    // Retrieves list of LLMs.
    public async Task<ServiceResponse<IEnumerable<LLMDto>>> GetAllLLMsAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<LLMDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get llms
            var llms = await _unitOfWork.LLMRepo
                        .GetAllAsync().Include(c => c.CreatedByUser)
                        .OrderBy(o => o.CreatedOn).ToListAsync();

            // Task successful
            serviceResponse.Data = llms.Adapt<IEnumerable<LLMDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "LLMs retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    // Checks the availability of a LLM name.
    public async Task<ServiceResponse<TrueFalseResultDto>> IsLLMNameAvailableAsync(CheckAvailabilityDto checkAvailabilityDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<TrueFalseResultDto>
        {
            Data = null,
            Message = "Failed to check LLM name availability. Please try again"
        };

        try
        {
            // Validate LLM uniqueness
            var llmAlreadyExists = await _unitOfWork.LLMRepo
                                                        .GetByConditionAsync(w =>
                                                         w.Name.ToLower() == checkAvailabilityDto.UserInput.Trim().ToLower())
                                                        .FirstOrDefaultAsync();

            // LLM already exists
            if (llmAlreadyExists != null)
            {
                serviceResponse.Data = new TrueFalseResultDto { Result = false };
                serviceResponse.StatusCode = 200;
                serviceResponse.Message = "A LLM with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = new TrueFalseResultDto { Result = true };
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "LLM name is available";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a new LLM
    public async Task<ServiceResponse<LLMDto>> InsertLLMAsync(LLMDto llmDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<LLMDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate LLM uniqueness
            var llmAlreadyExists = await _unitOfWork.LLMRepo
                                                        .GetByConditionAsync(w =>
                                                         w.Name.ToLower() == llmDto.Name.Trim().ToLower())
                                                        .FirstOrDefaultAsync();

            // LLM already exists
            if (llmAlreadyExists != null)
            {
                _logger.LogInformation($"LLM already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A LLM with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto' string props
            llmDto = TrimDtoStringPropsUtil.TrimDtoStringProps(llmDto);

            // Default mapping
            var newLLM = llmDto.Adapt<LLM>();
            newLLM.CreatedByUserId = _userId;
            newLLM.LastModifiedByUserId = _userId;

            //Insert a new LLM
            await _unitOfWork.LLMRepo.InsertAsync(newLLM);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting a LLM.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newLLM.Adapt<LLMDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "LLM added successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Updates a LLM
    public async Task<ServiceResponse<LLMDto>> UpdateLLMAsync(LLMDto llmDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<LLMDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate LLM uniqueness
            var llmAlreadyExists = await _unitOfWork.LLMRepo
                                                        .GetByConditionAsync(w =>
                                                            w.Name.ToLower() == llmDto.Name.Trim().ToLower()
                                                            && w.Id != llmDto.Id)
                                                        .FirstOrDefaultAsync();

            // LLM already exists
            if (llmAlreadyExists != null)
            {
                _logger.LogInformation($"LLM already exists");
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A LLM with same name already exists. Please enter a unique name";
                return serviceResponse;
            }

            // Trim dto' string props
            llmDto = TrimDtoStringPropsUtil.TrimDtoStringProps(llmDto);

            // Validate LLM existence
            var llm = await _unitOfWork.LLMRepo
                .GetByConditionAsync(v => v.Id == llmDto.Id)
                .SingleOrDefaultAsync();

            // LLM does not exist
            if (llm == null)
            {
                _logger.LogInformation($"LLM does not exist");
                serviceResponse.Message = "LLM does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newLLM = llmDto.Adapt(llm);
            newLLM.CreatedByUserId = _userId;
            newLLM.LastModifiedByUserId = _userId;

            //Update a LLM
            _unitOfWork.LLMRepo.Update(newLLM);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating a LLM.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newLLM.Adapt<LLMDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "LLM updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Deletes a LLM
    public async Task<ServiceResponse<bool>> DeleteLLMAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get a LLM using identifier
            var llm = await _unitOfWork.LLMRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if LLM not exists
            if (llm == null)
            {
                _logger.LogInformation($"LLM does not exist");
                serviceResponse.Message = "LLM does not exist";
                return serviceResponse;
            }

            //Delete a LLM field
            _unitOfWork.LLMRepo.Delete(llm);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting a LLM.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "LLM deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Get a LLM by identifier
    public async Task<ServiceResponse<LLMDto>> GetLLMByIdAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<LLMDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get a LLM using identifier
            var llm = await _unitOfWork.LLMRepo
            .GetByConditionAsync(v => v.Id == id).Include(c => c.CreatedByUser)
            .SingleOrDefaultAsync();

            //Check if LLM not exists
            if (llm == null)
            {
                _logger.LogInformation($"LLM does not exist");
                serviceResponse.Message = "LLM does not exist";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = llm.Adapt<LLMDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "LLM retrived successfully";

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
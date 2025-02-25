namespace MLModelBuilderAPIs.Services;

public class AnnotationDataService : IAnnotationDataService
{
    #region Fields

    private readonly ILogger<AnnotationDataService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    #endregion

    #region  Constructors
    public AnnotationDataService(
        ILogger<AnnotationDataService> logger,
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

    // Retrieves list of annotated data.
    public async Task<ServiceResponse<IEnumerable<AnnotationDataDto>>> GetAnnotationDataListAsync(Guid mlModelId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<AnnotationDataDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Try to get annotation data
            var data = await _unitOfWork.AnnotationDataRepo
                        .GetByConditionAsync(d => d.MLModelId == mlModelId).Include(c => c.CreatedByUser)
                        .OrderBy(o => o.CreatedOn).ToListAsync();

            // Task successful
            serviceResponse.Data = data.Adapt<IEnumerable<AnnotationDataDto>>();
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

    //Creates a new annotation data
    public async Task<ServiceResponse<AnnotationDataDto>> InsertAnnotationDataAsync(AnnotationDataDto annotationDataDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AnnotationDataDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Default mapping
            var newData = annotationDataDto.Adapt<AnnotationData>();
            newData.CreatedByUserId = _userId;
            newData.LastModifiedByUserId = _userId;

            //Insert a new annotation data
            await _unitOfWork.AnnotationDataRepo.InsertAsync(newData);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting an annotated data.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newData.Adapt<AnnotationDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Annotation data added successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Updates an annotation data
    public async Task<ServiceResponse<AnnotationDataDto>> UpdateAnnotationDataAsync(AnnotationDataDto annotationDataDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AnnotationDataDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate annotation data existence
            var data = await _unitOfWork.AnnotationDataRepo
                .GetByConditionAsync(d => d.Id == annotationDataDto.Id)
                .SingleOrDefaultAsync();

            // Annotation data does not exist
            if (data == null)
            {
                _logger.LogInformation($"Annotation data does not exist");
                serviceResponse.Message = "Annotation data does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newData = annotationDataDto.Adapt(data);
            newData.CreatedByUserId = _userId;
            newData.LastModifiedByUserId = _userId;

            //Update an annotation data
            _unitOfWork.AnnotationDataRepo.Update(newData);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating an annotated data.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newData.Adapt<AnnotationDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Annotation data updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Deletes an annotation data
    public async Task<ServiceResponse<bool>> DeleteAnnotationDataAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get an annotation data using identifier
            var data = await _unitOfWork.AnnotationDataRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if annotation data not exists
            if (data == null)
            {
                _logger.LogInformation($"Annotation data does not exist");
                serviceResponse.Message = "Annotation data does not exist";
                return serviceResponse;
            }

            //Delete an annotation data
            _unitOfWork.AnnotationDataRepo.Delete(data);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting an annotation data.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Annotation data deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }

    //Get an annotation data by an identifier
    public async Task<ServiceResponse<AnnotationDataDto>> GetAnnotationDataByIdAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<AnnotationDataDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get an annotation data using identifier
            var data = await _unitOfWork.AnnotationDataRepo
            .GetByConditionAsync(d => d.Id == id).Include(c => c.CreatedByUser)
            .SingleOrDefaultAsync();

            //Check if annotation data not exists
            if (data == null)
            {
                _logger.LogInformation($"Annotation data does not exist");
                serviceResponse.Message = "Annotation data does not exist";
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = data.Adapt<AnnotationDataDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Annotation data retrived successfully";

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
namespace AccountsAPIs.Services;

public class BillingDetailService : IBillingDetailService
{
    private readonly ILogger<BillingDetailService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public BillingDetailService(
        ILogger<BillingDetailService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    //Get a list of billing accounts
    public async Task<ServiceResponse<IEnumerable<BillingAccountDetailsDto>>> GetBillingDetailListAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<BillingAccountDetailsDto>>
        {
            Data = null,
            Message = "Failed to retrieve billing details. Please try again"
        };

        try
        {
            //Try to get billing account details
            var BillingDetails = await _unitOfWork.BillingDetailRepo
            .GetAllAsync()
            .Include(i => i.TenantSubscription)
            .OrderByDescending(o => o.Id)
            .ToListAsync();

            // Task successful
            serviceResponse.Data = BillingDetails.Adapt<IEnumerable<BillingAccountDetailsDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Billing accounts retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a billing account
    public async Task<ServiceResponse<BillingDetailDto>> InsertBillingDetailAsync(BillingDetailDto BillingDetailDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<BillingDetailDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Default mapping
            var newBillingDetail = BillingDetailDto.Adapt<BillingDetail>();
            newBillingDetail.CreatedByUserId = _userId;
            newBillingDetail.LastModifiedByUserId = _userId;

            //Insert a billing account
            await _unitOfWork.BillingDetailRepo.InsertAsync(newBillingDetail);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new subscription.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newBillingDetail.Adapt<BillingDetailDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Billing account added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates a billing account
    public async Task<ServiceResponse<BillingDetailDto>> UpdateBillingDetailAsync(BillingDetailDto BillingDetailDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<BillingDetailDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate billing account existence
            var BillingDetail = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(v => v.Id == BillingDetailDto.Id)
                .SingleOrDefaultAsync();

            // Billing account does not exist
            if (BillingDetail == null)
            {
                _logger.LogInformation($"Billing account does not exist");
                serviceResponse.Message = "Billing account does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newBillingDetail = BillingDetailDto.Adapt(BillingDetail);

            //create an updated billing account
            _unitOfWork.BillingDetailRepo.Update(newBillingDetail);
            newBillingDetail.CreatedByUserId = _userId;
            newBillingDetail.LastModifiedByUserId = _userId;

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating subscription.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newBillingDetail.Adapt<BillingDetailDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Billing account updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }


    //Deletes a billing account 
    public async Task<ServiceResponse<bool>> DeleteBillingDetailAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get billing account using identifier
            var BillingDetail = await _unitOfWork.BillingDetailRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if billing account not exists
            if (BillingDetail == null)
            {
                _logger.LogInformation($"Billing account does not exist");
                serviceResponse.Message = "Billing account does not exist";
                return serviceResponse;
            }

            //Delete billing account
            _unitOfWork.BillingDetailRepo.Delete(BillingDetail);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting subscription.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Billing account deleted successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }
}
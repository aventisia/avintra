namespace AccountsAPIs.Services;

public class BillingAccountService : IBillingAccountService
{
    private readonly ILogger<BillingAccountService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public BillingAccountService(
        ILogger<BillingAccountService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    //Get a list of billing accounts
    public async Task<ServiceResponse<IEnumerable<BillingAccountDto>>> GetBillingAccountListAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<BillingAccountDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get billing account details
            var billingAccounts = await _unitOfWork.BillingDetailRepo
            .GetAllAsync().OrderByDescending(o => o.Id).ToListAsync();

            // Task successful
            serviceResponse.Data = billingAccounts.Adapt<IEnumerable<BillingAccountDto>>();
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
    public async Task<ServiceResponse<BillingAccountDto>> InsertBillingAccountAsync(BillingAccountDto billingAccountDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<BillingAccountDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Default mapping
            var newBillingAccount = billingAccountDto.Adapt<BillingDetail>();
            newBillingAccount.CreatedByUserId = _userId;
            newBillingAccount.LastModifiedByUserId = _userId;

            //Insert a billing account
            await _unitOfWork.BillingDetailRepo.InsertAsync(newBillingAccount);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new subscription.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newBillingAccount.Adapt<BillingAccountDto>();
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
    public async Task<ServiceResponse<BillingAccountDto>> UpdateBillingAccountAsync(BillingAccountDto billingAccountDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<BillingAccountDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate billing account existence
            var billingAccount = await _unitOfWork.BillingDetailRepo
                .GetByConditionAsync(v => v.Id == billingAccountDto.Id)
                .SingleOrDefaultAsync();

            // Billing account does not exist
            if (billingAccount == null)
            {
                _logger.LogInformation($"Billing account does not exist");
                serviceResponse.Message = "Billing account does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newBillingAccount = billingAccountDto.Adapt(billingAccount);

            //create an updated billing account
            _unitOfWork.BillingDetailRepo.Update(newBillingAccount);
            newBillingAccount.CreatedByUserId = _userId;
            newBillingAccount.LastModifiedByUserId = _userId;

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating subscription.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newBillingAccount.Adapt<BillingAccountDto>();
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
    public async Task<ServiceResponse<bool>> DeleteBillingAccountAsync(Guid id)
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
            var billingAccount = await _unitOfWork.BillingDetailRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if billing account not exists
            if (billingAccount == null)
            {
                _logger.LogInformation($"Billing account does not exist");
                serviceResponse.Message = "Billing account does not exist";
                return serviceResponse;
            }

            //Delete billing account
            _unitOfWork.BillingDetailRepo.Delete(billingAccount);

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
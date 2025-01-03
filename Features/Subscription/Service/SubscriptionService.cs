namespace WorkspaceAPIs.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly ILogger<SubscriptionService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public SubscriptionService(
        ILogger<SubscriptionService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }


    public async Task<ServiceResponse<IEnumerable<SubscriptionDto>>> GetSubscriptionListAsync(Guid planId, Guid userId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<SubscriptionDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            //Try to get subscriptions
            var subscriptions = await _unitOfWork.SubscriptionRepo
            .GetByConditionAsync(s => s.PlanId == planId && s.CreatedByUserId == userId & s.IsActive == true)
            .OrderByDescending(o => o.Id).ToListAsync();

            // Task successful
            serviceResponse.Data = subscriptions.Adapt<IEnumerable<SubscriptionDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscriptions retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Creates a subscription
    public async Task<ServiceResponse<SubscriptionDto>> InsertSubscriptionAsync(SubscriptionDto subscriptionDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<SubscriptionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Default mapping
            var newSubscription = subscriptionDto.Adapt<Subscription>();
            newSubscription.IsActive = true;
            newSubscription.CreatedByUserId = _userId;
            newSubscription.LastModifiedByUserId = _userId;

            //Insert a flow version
            await _unitOfWork.SubscriptionRepo.InsertAsync(newSubscription);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new subscription.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newSubscription.Adapt<SubscriptionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription added successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    //Updates a subscription
    public async Task<ServiceResponse<SubscriptionDto>> UpdateSubscriptionAsync(SubscriptionDto subscriptionDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<SubscriptionDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Validate subscription existence
            var subscription = await _unitOfWork.SubscriptionRepo
                .GetByConditionAsync(v => v.Id == subscriptionDto.Id)
                .SingleOrDefaultAsync();

            // Subscription does not exist
            if (subscription == null)
            {
                _logger.LogInformation($"Subscription does not exist");
                serviceResponse.Message = "Subscription does not exist";
                return serviceResponse;
            }

            // Auto mapping 
            var newSubscription = subscriptionDto.Adapt(subscription);

            //create an updated subscription
            _unitOfWork.SubscriptionRepo.Update(newSubscription);
            newSubscription.IsActive = true;
            newSubscription.CreatedByUserId = _userId;
            newSubscription.LastModifiedByUserId = _userId;

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating subscription.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newSubscription.Adapt<SubscriptionDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription updated successfully";

        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }


    //Deletes a subscription
    public async Task<ServiceResponse<bool>> DeleteSubscriptionAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            StatusCode = 400
        };

        try
        {
            //Try to get subscription using identifier
            var subscription = await _unitOfWork.SubscriptionRepo
            .GetByConditionAsync(v => v.Id == id)
            .SingleOrDefaultAsync();

            //Check if subscription not exists
            if (subscription == null)
            {
                _logger.LogInformation($"Subscription does not exist");
                serviceResponse.Message = "Subscription does not exist";
                return serviceResponse;
            }

            //Delete subscription
            _unitOfWork.SubscriptionRepo.Delete(subscription);

            //Delete-job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting subscription.");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Subscription deleted successfully";

        }
        catch(Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }
        return serviceResponse;
    }
}
namespace WorkspaceAPIs.Services;

public class SupportTicketRemarksService : ISupportTicketRemarksService
{
    private readonly ILogger<SupportTicketRemarksService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public SupportTicketRemarksService(
        ILogger<SupportTicketRemarksService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Create a new support ticket remark.
    public async Task<ServiceResponse<SupportTicketRemarksDto>> InsertSupportTicketRemarkAsync(SupportTicketRemarksDto supportTicketRemarksDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<SupportTicketRemarksDto>
        {
            Data = null,
            Message = "Failed to add support ticket remark. Please try again"
        };

        try
        {
            // Trim dto' string props
            supportTicketRemarksDto = TrimDtoStringPropsUtil.TrimDtoStringProps(supportTicketRemarksDto);

            // Default mapping
            var newSupportTicketRemark = supportTicketRemarksDto.Adapt<SupportTicketRemark>();
            newSupportTicketRemark.UserId = _userId;

            // Insert support ticket remark
            await _unitOfWork.SupportTicketRemarkRepo.InsertAsync(newSupportTicketRemark);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new support ticket remark");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = newSupportTicketRemark.Adapt<SupportTicketRemarksDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "support ticket remark added successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Update the support ticket remark with IsEdited flag
    public async Task<ServiceResponse<SupportTicketRemarksDto>> UpdateSupportTicketRemarkAsync(SupportTicketRemarksDto supportTicketRemarksDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<SupportTicketRemarksDto>
        {
            Data = null,
            Message = "Failed to update support ticket remark. Please try again"
        };

        try
        {
            // Validate support ticket remark existence
            var supportTicketRemark = await _unitOfWork.SupportTicketRemarkRepo
                                        .GetByConditionAsync(w => w.Id == supportTicketRemarksDto.Id && w.UserId == _userId)
                                        .SingleOrDefaultAsync();

            // support ticket remark does not exist
            if (supportTicketRemark == null)
            {
                _logger.LogInformation($"support ticket remark does not exist");
                serviceResponse.Message = "support ticket remark does not exist";
                return serviceResponse;
            }

            // Trim dto' string props
            supportTicketRemarksDto = TrimDtoStringPropsUtil.TrimDtoStringProps(supportTicketRemarksDto);

            // Manual mapping - auto mapping is not required
            supportTicketRemark.Message = supportTicketRemarksDto.Message;
            supportTicketRemark.LastModifiedOn = DateTimeOffset.UtcNow;
            supportTicketRemark.IsEdited = true;

            // Update support ticket remark
            _unitOfWork.SupportTicketRemarkRepo.Update(supportTicketRemark);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while updating support ticket remark");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = supportTicketRemark.Adapt<SupportTicketRemarksDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "support ticket remark updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes support ticket remark permanently.
    public async Task<ServiceResponse<bool>> DeleteSupportTicketRemarkAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete support ticket remark. Please try again"
        };

        try
        {
            // Validate support ticket remark existence
            var supportTicketRemark = await _unitOfWork.SupportTicketRemarkRepo
                                        .GetByConditionAsync(w => w.Id == id && w.UserId == _userId)
                                        .SingleOrDefaultAsync();

            // support ticket remark does not exist
            if (supportTicketRemark == null)
            {
                _logger.LogInformation($"support ticket remark does not exist");
                serviceResponse.Message = "support ticket remark does not exist";
                return serviceResponse;
            }

            // Delete support ticket remark
            _unitOfWork.SupportTicketRemarkRepo.Delete(supportTicketRemark);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting support ticket remark");
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "support ticket remark deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

}

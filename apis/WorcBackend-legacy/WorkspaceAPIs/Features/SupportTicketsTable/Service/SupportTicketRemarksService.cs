using System.Linq.Expressions;

namespace WorkspaceAPIs.Services;

public class SupportTicketRemarksService : ISupportTicketRemarksService
{
    private readonly ILogger<SupportTicketRemarksService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly List<string> _userRoles;
    private readonly INotificationHelperService _notificationHelperService;

    public SupportTicketRemarksService(
        ILogger<SupportTicketRemarksService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor,
        INotificationHelperService notificationHelperService)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        // Set _userRoles
        _userRoles = httpContextAccessor.HttpContext?.User?.FindAll(ClaimTypes.Role).Select(c => c.Value).ToList() ?? new List<string>();

        _logger = logger;
        _unitOfWork = unitOfWork;
        _notificationHelperService = notificationHelperService;
    }

    // Check if user is an agent
    private bool IsAgent()
    {
        return _userRoles.Contains("SA");
    }

    // Retrieves all remarks associated with a support ticket.
    public async Task<ServiceResponse<IEnumerable<SupportTicketRemarksDto>>> GetSupportTicketRemarksAsync(Guid supportTicketId)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<SupportTicketRemarksDto>>
        {
            Data = null,
            Message = "Failed to retrieve support ticket remarks. Please try again"
        };

        try
        {
            // Check if support ticket exists for the input support ticket id
            var supportTicket = await _unitOfWork.SupportTicketRepo
                .GetByConditionAsync(w => (w.Id == supportTicketId) && (w.CreatedByUserId == _userId || IsAgent()))
                .ProjectToType<SupportTicketsTableDto>()
                .SingleOrDefaultAsync();

            // support ticket doesn't exist
            if (supportTicket == null)
            {
                serviceResponse.Message = "support ticket does not exist";
                return serviceResponse;
            }

            // Retrieve all remarks associated with the support ticket
            var supportTicketRemarks = await _unitOfWork.SupportTicketRemarkRepo
                                        .GetByConditionAsync(w => w.SupportTicketId == supportTicketId)
                                        .OrderBy(w => w.CreatedOn)
                                        .ProjectToType<SupportTicketRemarksDto>()
                                        .ToListAsync();

            // Task successful
            serviceResponse.Data = supportTicketRemarks.Adapt<IEnumerable<SupportTicketRemarksDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "support ticket remarks retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
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

            // Validate support ticket existence
            var supportTicket = await _unitOfWork.SupportTicketRepo
                                .GetByConditionAsync(w => w.Id == supportTicketRemarksDto.SupportTicketId)
                                .SingleOrDefaultAsync();

            // Support ticket does not exist
            if (supportTicket == null)
            {
                serviceResponse.Message = "Support ticket does not exist";
                return serviceResponse;
            }

            // Default mapping
            var newSupportTicketRemark = supportTicketRemarksDto.Adapt<SupportTicketRemark>();
            newSupportTicketRemark.UserId = _userId;

            // Manual mapping for support ticket
            supportTicket.LastModifiedOn = DateTimeOffset.UtcNow;
            supportTicket.LastModifiedByUserId = _userId;

            // Insert support ticket remark
            await _unitOfWork.SupportTicketRemarkRepo.InsertAsync(newSupportTicketRemark);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            newSupportTicketRemark.User = await _unitOfWork.WorkspaceUserRepo.GetByConditionAsync(w => w.Id == _userId).SingleOrDefaultAsync();

            // Update the support ticket's ReviewerId if the user adding the remark is not the creator
            if (supportTicket.CreatedByUserId != _userId)
            {
                supportTicket.ReviewerId = _userId;
                _unitOfWork.SupportTicketRepo.Update(supportTicket);

                if (!await _unitOfWork.SaveAsync())
                {
                    return serviceResponse;
                }

                // Create notification for the creator
                var notificationToCreator = new Notification
                {
                    TenantId = supportTicket.TenantId,
                    Message = $"A new remark has been added by the reviewer on your support ticket '{supportTicket.TicketNumber}'.",
                    Type = NotificationTypesEnum.Alert,
                    ActionUrl = $"/supportticket/details?st={supportTicket.Id}",
                    CreatedByUserId = _userId,
                    CreatedOn = DateTimeOffset.UtcNow,
                    LastModifiedByUserId = _userId,
                };

                await _unitOfWork.NotificationRepo.InsertAsync(notificationToCreator);
                await _unitOfWork.SaveAsync();

                // Add users to the notification
                var creatorUserId = supportTicket.CreatedByUserId;

                // Use NotificationHelperService to handle user relationships
                var addedSuccessfully = await _notificationHelperService.AddNotificationUsers(notificationToCreator.Id, new List<Guid> { creatorUserId });
                if (!addedSuccessfully)
                {
                    _logger.LogWarning("Failed to add notification users.");
                    serviceResponse.Message = "Failed to notify user.";
                    return serviceResponse;
                }

                await _unitOfWork.SaveAsync();
            }
            else if (supportTicket.ReviewerId.HasValue)
            {
                // Create notification for the reviewer
                var notificationToReviewer = new Notification
                {
                    TenantId = supportTicket.TenantId,
                    Message = $"'{(newSupportTicketRemark.User != null ? newSupportTicketRemark.User.FirstName + " " + newSupportTicketRemark.User.LastName : "User")}' has replied to your remark on the support ticket '{supportTicket.TicketNumber}'.",
                    Type = NotificationTypesEnum.Alert,
                    ActionUrl = $"/supportticket/details?st={supportTicket.Id}",
                    CreatedByUserId = _userId,
                    CreatedOn = DateTimeOffset.UtcNow,
                    LastModifiedByUserId = _userId,
                };

                await _unitOfWork.NotificationRepo.InsertAsync(notificationToReviewer);
                await _unitOfWork.SaveAsync();

                // Add users to the notification
                var reviewerUserId = supportTicket.ReviewerId.Value;
                var addedSuccessfully = await _notificationHelperService.AddNotificationUsers(notificationToReviewer.Id, new List<Guid> { reviewerUserId });
                if (!addedSuccessfully)
                {
                    _logger.LogWarning("Failed to add notification users.");
                    serviceResponse.Message = "Failed to notify user.";
                    return serviceResponse;
                }
                await _unitOfWork.SaveAsync();
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
                serviceResponse.Message = "support ticket remark does not exist";
                return serviceResponse;
            }

            // Get support ticket having this remark
            var supportTicket = await _unitOfWork.SupportTicketRepo
                                .GetByConditionAsync(w => w.Id == supportTicketRemark.SupportTicketId)
                                .SingleOrDefaultAsync();

            // Support ticket does not exist
            if (supportTicket == null)
            {
                serviceResponse.Message = "Support ticket does not exist";
                return serviceResponse;
            }


            // Trim dto' string props
            supportTicketRemarksDto = TrimDtoStringPropsUtil.TrimDtoStringProps(supportTicketRemarksDto);

            // Manual mapping - auto mapping is not required
            supportTicketRemark.Message = supportTicketRemarksDto.Message;
            supportTicketRemark.LastModifiedOn = DateTimeOffset.UtcNow;
            supportTicketRemark.IsEdited = true;

            // Manual mapping for support ticket
            supportTicket.LastModifiedOn = DateTimeOffset.UtcNow;
            supportTicket.LastModifiedByUserId = _userId;

            // Update support ticket remark
            _unitOfWork.SupportTicketRemarkRepo.Update(supportTicketRemark);

            // Update support ticket
            _unitOfWork.SupportTicketRepo.Update(supportTicket);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
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
                serviceResponse.Message = "support ticket remark does not exist";
                return serviceResponse;
            }

            // Get support ticket having this remark
            var supportTicket = await _unitOfWork.SupportTicketRepo
                                .GetByConditionAsync(w => w.Id == supportTicketRemark.SupportTicketId)
                                .SingleOrDefaultAsync();

            // Support ticket does not exist
            if (supportTicket == null)
            {
                serviceResponse.Message = "Support ticket does not exist";
                return serviceResponse;
            }

            // Manual mapping for support ticket
            supportTicket.LastModifiedOn = DateTimeOffset.UtcNow;
            supportTicket.LastModifiedByUserId = _userId;

            // Delete support ticket remark
            _unitOfWork.SupportTicketRemarkRepo.Delete(supportTicketRemark);

            // Update support ticket
            _unitOfWork.SupportTicketRepo.Update(supportTicket);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
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

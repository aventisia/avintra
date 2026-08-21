using System.Linq.Expressions;

namespace WorkspaceAPIs.Services;

public class SupportTicketsTableService : ISupportTicketsTableService
{
    private readonly ILogger<SupportTicketsTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;
    private readonly List<string> _userRoles;
    private readonly INotificationHelperService _notificationHelperService;

    public SupportTicketsTableService(
        ILogger<SupportTicketsTableService> logger,
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

    // Retrieves a support ticket by its ID/ticketNumber.
    public async Task<ServiceResponse<SupportTicketsTableDto>> GetSupportTicketAsync(string id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<SupportTicketsTableDto>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // check if id is valid Guid
            var result = Guid.TryParse(id, out Guid guidId);

            // if result is true then create where condition basis on guidId and _userId/IsAgent
            var whereCondition = result
                ? (Expression<Func<SupportTicket, bool>>)(w => (w.Id == guidId || w.TicketNumber == id) && (w.CreatedByUserId == _userId || IsAgent()))
                : (Expression<Func<SupportTicket, bool>>)(w => w.TicketNumber == id && (w.CreatedByUserId == _userId || IsAgent()));

            // Try to get support ticket
            var supportTicket = await _unitOfWork.SupportTicketRepo
                .GetByConditionAsync(whereCondition)
                .ProjectToType<SupportTicketsTableDto>()
                .SingleOrDefaultAsync();

            // support ticket doesn't exist
            if (supportTicket == null)
            {
                serviceResponse.Message = "support ticket does not exist";
                return serviceResponse;
            }

            // Order support ticket remarks by createdOn
            if (supportTicket.SupportTicketRemarks != null)
            {
                supportTicket.SupportTicketRemarks = supportTicket.SupportTicketRemarks.OrderBy(o => o.CreatedOn).ToList();
            }
            ;

            // Task successful
            serviceResponse.Data = supportTicket.Adapt<SupportTicketsTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "support ticket retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Retrieves list of support tickets.
    public async Task<ServiceResponse<IEnumerable<SupportTicketsTableDto>>> GetSupportTicketsAsync()
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<IEnumerable<SupportTicketsTableDto>>
        {
            Data = null,
            StatusCode = 400
        };

        try
        {
            // Create where condition basis on _userId/IsAgent
            var whereCondition = IsAgent()
                ? (Expression<Func<SupportTicket, bool>>)(w => true)
                : (Expression<Func<SupportTicket, bool>>)(w => w.CreatedByUserId == _userId);

            // Try to get support tickets
            var supportTickets = await _unitOfWork.SupportTicketRepo
                                        .GetByConditionAsync(whereCondition)
                                        .OrderByDescending(o => o.CreatedOn)
                                        .ProjectToType<SupportTicketsTableDto>()
                                        .ToListAsync();

            // Task successful
            serviceResponse.Data = supportTickets.Adapt<List<SupportTicketsTableDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "support tickets retrieved successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Inserts a new support ticket.
    public async Task<ServiceResponse<SupportTicketsTableDto>> InsertSupportTicketAsync(SupportTicketsTableDto supportTicketsTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<SupportTicketsTableDto>
        {
            Data = null,
            Message = "Failed to insert support ticket. Please try again"
        };

        try
        {
            // Validate support ticket uniqueness
            var supportTicketAlreadyExists = await _unitOfWork.SupportTicketRepo
                .GetByConditionAsync(w => w.TicketNumber != null && supportTicketsTableDto.TicketNumber != null && w.TicketNumber.ToLower() == supportTicketsTableDto.TicketNumber.ToLower())
                .FirstOrDefaultAsync();

            // support ticket already exists
            if (supportTicketAlreadyExists != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A support ticket with the same TicketNumber already exists. Please enter a unique TicketNumber";
                return serviceResponse;
            }

            // Trim dto' string props
            supportTicketsTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(supportTicketsTableDto);

            // Default mapping
            var newSupportTicket = supportTicketsTableDto.Adapt<SupportTicket>();
            newSupportTicket.CreatedByUserId = _userId;
            newSupportTicket.LastModifiedByUserId = _userId;

            // Additional mapping
            newSupportTicket.TicketNumber = "SR#" + DateTime.UtcNow.ToString("yyyyMMddHHmmss");

            // Insert support ticket
            await _unitOfWork.SupportTicketRepo.InsertAsync(newSupportTicket);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Get the user who created the support ticket
            newSupportTicket.CreatedByUser = await _unitOfWork.WorkspaceUserRepo.GetByConditionAsync(w => w.Id == _userId).SingleOrDefaultAsync();

            // Get the reviewer of the support ticket
            newSupportTicket.Reviewer = await _unitOfWork.WorkspaceUserRepo.GetByConditionAsync(w => w.Id == newSupportTicket.ReviewerId).SingleOrDefaultAsync();

            // Get the user who created the support ticket
            var creator = await _unitOfWork.WorkspaceUserRepo.GetByConditionAsync(w => w.Id == _userId).SingleOrDefaultAsync();

            // Create notification for the creator
            var notificationToCreator = new Notification
            {
                TenantId = newSupportTicket.TenantId,
                Message = $"Your support ticket '{newSupportTicket.TicketNumber}' has been successfully created.",
                Type = NotificationTypesEnum.Information,
                ActionUrl = $"/supportticket/details?st={newSupportTicket.Id}",
                CreatedByUserId = _userId,
                CreatedOn = DateTimeOffset.UtcNow,
                LastModifiedByUserId = _userId,
            };

            // Insert the notification
            await _unitOfWork.NotificationRepo.InsertAsync(notificationToCreator);
            // Save changes for the notification
            await _unitOfWork.SaveAsync();

            // Add the creator as a notification recipient
            var addedSuccessfully = await _notificationHelperService.AddNotificationUsers(notificationToCreator.Id, new List<Guid> { _userId });
            if (!addedSuccessfully)
            {
                _logger.LogWarning("Failed to add notification users.");
                serviceResponse.Message = "Failed to notify user.";
                return serviceResponse;
            }
            // Save changes for the notification
            await _unitOfWork.SaveAsync();

            // Task successful
            serviceResponse.Data = newSupportTicket.Adapt<SupportTicketsTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "support ticket created successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing support ticket (not being used in the current implementation).
    public async Task<ServiceResponse<SupportTicketsTableDto>> UpdateSupportTicketAsync(SupportTicketsTableDto supportTicketsTableDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<SupportTicketsTableDto>
        {
            Data = null,
            Message = "Failed to update support ticket. Please try again"
        };

        try
        {
            // Validate support ticket existence
            var supportTicket = await _unitOfWork.SupportTicketRepo
                .GetByConditionAsync(w => w.Id == supportTicketsTableDto.Id && w.CreatedByUserId == _userId)
                .SingleOrDefaultAsync();

            // Support ticket does not exist
            if (supportTicket == null)
            {
                serviceResponse.Message = "Support ticket does not exist";
                return serviceResponse;
            }

            // Validate support ticket uniqueness
            var supportTicketAlreadyExists = await _unitOfWork.SupportTicketRepo
                .GetByConditionAsync(w => w.TicketNumber != null && supportTicketsTableDto.TicketNumber != null && w.TicketNumber.ToLower() == supportTicketsTableDto.TicketNumber.ToLower() && w.Id != supportTicketsTableDto.Id)
                .FirstOrDefaultAsync();

            // Support ticket already exists
            if (supportTicketAlreadyExists != null)
            {
                serviceResponse.StatusCode = 409;
                serviceResponse.Message = "A support ticket with the same TicketNumber already exists. Please enter a unique TicketNumber";
                return serviceResponse;
            }

            // Trim dto' string props
            supportTicketsTableDto = TrimDtoStringPropsUtil.TrimDtoStringProps(supportTicketsTableDto);

            // Default mapping
            supportTicket = supportTicketsTableDto.Adapt(supportTicket);
            supportTicket.LastModifiedByUserId = _userId;

            // Manual mapping
            supportTicket.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update support ticket
            _unitOfWork.SupportTicketRepo.Update(supportTicket);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Task successful
            serviceResponse.Data = supportTicket.Adapt<SupportTicketsTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Support ticket updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Updates an existing support ticket status by reviewer.
    public async Task<ServiceResponse<SupportTicketsTableDto>> UpdateSupportTicketStatusAsync(STUpdateByReviewerDto stUpdateByReviewerDto)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<SupportTicketsTableDto>
        {
            Data = null,
            Message = "Failed to update support ticket. Please try again"
        };

        try
        {
            // Validate support ticket existence
            var supportTicket = await _unitOfWork.SupportTicketRepo
                .GetByConditionAsync(w => (w.Id == stUpdateByReviewerDto.TicketId || (w.TicketNumber == stUpdateByReviewerDto.TicketNumber)))
                .SingleOrDefaultAsync();

            // Support ticket does not exist
            if (supportTicket == null)
            {
                serviceResponse.Message = "Support ticket does not exist";
                return serviceResponse;
            }

            // Trim dto' string props
            stUpdateByReviewerDto = TrimDtoStringPropsUtil.TrimDtoStringProps(stUpdateByReviewerDto);

            // Default mapping
            supportTicket = stUpdateByReviewerDto.Adapt(supportTicket);
            supportTicket.LastModifiedByUserId = _userId;

            // Manual mapping
            supportTicket.LastModifiedOn = DateTimeOffset.UtcNow;

            // Update support ticket
            _unitOfWork.SupportTicketRepo.Update(supportTicket);

            // Update-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Check if the status is being updated to "Closed"
            if (supportTicket.Status == "Closed")
            {
                var notification = new Notification
                {
                    TenantId = supportTicket.TenantId,
                    Message = $"Your support ticket '{supportTicket.TicketNumber}' has been closed.",
                    Type = NotificationTypesEnum.Alert,
                    ActionUrl = $"/supportticket/details?st={supportTicket.Id}",
                    CreatedByUserId = _userId,
                    CreatedOn = DateTimeOffset.UtcNow,
                    LastModifiedByUserId = _userId,
                };

                await _unitOfWork.NotificationRepo.InsertAsync(notification);
                await _unitOfWork.SaveAsync();

                var userIds = new List<Guid> { supportTicket.CreatedByUserId };
                var addedSuccessfully = await _notificationHelperService.AddNotificationUsers(notification.Id, userIds);
                if (!addedSuccessfully)
                {
                    _logger.LogWarning("Failed to add notification users.");
                    serviceResponse.Message = "Failed to notify user.";
                    return serviceResponse;
                }
                await _unitOfWork.SaveAsync();
            }

            // Task successful
            serviceResponse.Data = supportTicket.Adapt<SupportTicketsTableDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Support ticket updated successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

    // Deletes a support ticket by its ID.
    public async Task<ServiceResponse<bool>> DeleteSupportTicketAsync(Guid id)
    {
        // Initialize ServiceResponse with failed response
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete support ticket. Please try again"
        };

        try
        {
            // Validate support ticket existence
            var supportTicket = await _unitOfWork.SupportTicketRepo
                                        .GetByConditionAsync(w => w.Id == id && w.CreatedByUserId == _userId)
                                        .SingleOrDefaultAsync();

            // support ticket does not exist
            if (supportTicket == null)
            {
                serviceResponse.Message = "support ticket does not exist";
                return serviceResponse;
            }

            //#PENDING: UPDATE THIS CHECK ONCE ENTITY IS FORMED
            // IMPORTANT: Check if any relationship exists and abort required
            // var relationshipExists = await _unitOfWork.SupportTicketRepo
            //                                 .DoesDependentEntitiesExistAsync(w => w.Id == id);

            // Relationship exists
            // if (relationshipExists)
            // {
            //     _logger.LogInformation($"Cannot delete support ticket because it is linked with other support tickets");
            //     serviceResponse.Message = "Cannot delete requested support ticket because it is linked with other support tickets";
            //     return serviceResponse;
            // }

            // Support ticket status is not 'Open'
            if (supportTicket.Status?.CompareTo("Open") != 0)
            {
                serviceResponse.Message = "Cannot delete requested support ticket because it is not in 'Open' status";
                return serviceResponse;
            }

            // Get the reviewer of the support ticket
            var reviewer = await _unitOfWork.WorkspaceUserRepo
                .GetByConditionAsync(w => w.Id == supportTicket.ReviewerId)
                .SingleOrDefaultAsync();

            // Delete support ticket
            _unitOfWork.SupportTicketRepo.Delete(supportTicket);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                return serviceResponse;
            }

            // Create notification for the reviewer
            if (reviewer != null)
            {
                var notificationToReviewer = new Notification
                {
                    TenantId = supportTicket.TenantId,
                    Message = $"The support ticket '{supportTicket.TicketNumber}' that you were reviewing has been deleted.",
                    Type = NotificationTypesEnum.Alert,
                    CreatedByUserId = _userId,
                    CreatedOn = DateTimeOffset.UtcNow,
                    LastModifiedByUserId = _userId,
                };

                // Insert the notification
                await _unitOfWork.NotificationRepo.InsertAsync(notificationToReviewer);

                // Add the reviewer as a notification recipient
                var addedSuccessfully = await _notificationHelperService.AddNotificationUsers(notificationToReviewer.Id, new List<Guid> { reviewer.Id });
                if (!addedSuccessfully)
                {
                    _logger.LogWarning("Failed to add notification users.");
                    serviceResponse.Message = "Failed to notify reviewer.";
                    return serviceResponse;
                }
                await _unitOfWork.SaveAsync();
            }

            // Task successful
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "support ticket deleted successfully";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex.ToString());
            return serviceResponse;
        }

        return serviceResponse;
    }

}
using System.Linq.Expressions;

namespace WorkspaceAPIs.Services;

public class SupportTicketReviewerService : ISupportTicketReviewerService
{
    private readonly ILogger<SupportTicketReviewerService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public SupportTicketReviewerService(
        ILogger<SupportTicketReviewerService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a support ticket associated with reviewer by ticketId/ticketNumber.
    public async Task<ServiceResponse<SupportTicketsTableDto>> GetSupportTicketAsync(string ticketId)
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
            var result = Guid.TryParse(ticketId, out Guid guidId);

            // if result is true then create where condition basis on guidId
            var whereCondition = result ? (Expression<Func<SupportTicket, bool>>)(w => w.Id == guidId && w.ReviewerId == _userId) : (Expression<Func<SupportTicket, bool>>)(w => w.TicketNumber == ticketId && w.ReviewerId == _userId);

            // Try to get support ticket
            var supportTicket = await _unitOfWork.SupportTicketRepo
                .GetByConditionAsync(whereCondition)
                .ProjectToType<SupportTicketsTableDto>()
                .SingleOrDefaultAsync();

            // support ticket doesn't exist
            if (supportTicket == null)
            {
                _logger.LogInformation($"support ticket not found for Id {ticketId}");
                serviceResponse.Message = "support ticket does not exist";
                return serviceResponse;
            }

            // Order support ticket remarks by CreatedOn
            if (supportTicket.SupportTicketRemarks != null)
            {
                supportTicket.SupportTicketRemarks = supportTicket.SupportTicketRemarks.OrderBy(o => o.CreatedOn).ToList();
            };

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

    // Retrieves all support tickets associated with a reviewerId.
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
            // Try to get support tickets
            var supportTickets = await _unitOfWork.SupportTicketRepo
                                        .GetByConditionAsync(w => w.ReviewerId == _userId)
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

    // Insert a new remark to the existing support ticket
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
                _logger.LogInformation($"Support ticket does not exist");
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

            // Update support ticket
            _unitOfWork.SupportTicketRepo.Update(supportTicket);

            // Insert-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while inserting new support ticket remark");
                return serviceResponse;
            }

            newSupportTicketRemark.User = await _unitOfWork.WorkspaceUserRepo.GetByConditionAsync(w => w.Id == _userId).SingleOrDefaultAsync();

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

            // Get support ticket having this remark
            var supportTicket = await _unitOfWork.SupportTicketRepo
                                .GetByConditionAsync(w => w.Id == supportTicketRemark.SupportTicketId)
                                .SingleOrDefaultAsync();

            // Support ticket does not exist
            if (supportTicket == null)
            {
                _logger.LogInformation($"Support ticket does not exist");
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

            // Get support ticket having this remark
            var supportTicket = await _unitOfWork.SupportTicketRepo
                                .GetByConditionAsync(w => w.Id == supportTicketRemark.SupportTicketId)
                                .SingleOrDefaultAsync();

            // Support ticket does not exist
            if (supportTicket == null)
            {
                _logger.LogInformation($"Support ticket does not exist");
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
                _logger.LogInformation($"support ticket already exists");
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
                _logger.LogInformation("Context SaveChanges failed while inserting new support ticket");
                return serviceResponse;
            }

            // Get the user who created the support ticket
            newSupportTicket.CreatedByUser = await _unitOfWork.WorkspaceUserRepo.GetByConditionAsync(w => w.Id == _userId).SingleOrDefaultAsync();

            // Get the reviewer of the support ticket
            newSupportTicket.Reviewer = await _unitOfWork.WorkspaceUserRepo.GetByConditionAsync(w => w.Id == newSupportTicket.ReviewerId).SingleOrDefaultAsync();

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

    // Updates an existing support ticket.
    public async Task<ServiceResponse<SupportTicketsTableDto>> UpdateSupportTicketAsync(STUpdateByReviewerDto stUpdateByReviewerDto)
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
                .GetByConditionAsync(w => (w.Id == stUpdateByReviewerDto.TicketId || (w.TicketNumber == stUpdateByReviewerDto.TicketNumber)) && w.ReviewerId == _userId)
                .SingleOrDefaultAsync();

            // Support ticket does not exist
            if (supportTicket == null)
            {
                _logger.LogInformation($"Support ticket does not exist");
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
                _logger.LogInformation("Context SaveChanges failed while updating support ticket");
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
}
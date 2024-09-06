using System.Linq.Expressions;

namespace WorkspaceAPIs.Services;

public class SupportTicketsTableService : ISupportTicketsTableService
{
    private readonly ILogger<SupportTicketsTableService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public SupportTicketsTableService(
        ILogger<SupportTicketsTableService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Set _userId
        _userId = Guid.Parse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ?? Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
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

            // if result is true then create where condition basis on guidId
            var whereCondition = result ? (Expression<Func<SupportTicket, bool>>)(w => w.Id == guidId) : (Expression<Func<SupportTicket, bool>>)(w => w.TicketNumber == id);

            // Try to get support ticket
            var supportTicket = await _unitOfWork.SupportTicketRepo
                .GetByConditionAsync(whereCondition)
                .ProjectToType<SupportTicketsTableDto>()
                .SingleOrDefaultAsync();

            // support ticket doesn't exist
            if (supportTicket == null)
            {
                _logger.LogInformation($"support ticket not found for Id {id}");
                serviceResponse.Message = "support ticket does not exist";
                return serviceResponse;
            }

            // Order support ticket remarks by createdOn
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
            // Try to get support tickets
            var supportTickets = await _unitOfWork.SupportTicketRepo
                                        .GetByConditionAsync(w => true) //PEDNING: Update condition
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
                .GetByConditionAsync(w => w.Id == supportTicketsTableDto.Id)
                .SingleOrDefaultAsync();

            // Support ticket does not exist
            if (supportTicket == null)
            {
                _logger.LogInformation($"Support ticket does not exist");
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
                _logger.LogInformation($"Support ticket already exists");
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
                                        .GetByConditionAsync(w => w.Id == id)
                                        .SingleOrDefaultAsync();

            // support ticket does not exist
            if (supportTicket == null)
            {
                _logger.LogInformation($"support ticket does not exist");
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
                _logger.LogInformation($"Cannot delete support ticket because it is not in 'Open' status");
                serviceResponse.Message = "Cannot delete requested support ticket because it is not in 'Open' status";
                return serviceResponse;
            }

            // Delete support ticket
            _unitOfWork.SupportTicketRepo.Delete(supportTicket);

            // Delete-Job failed
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogInformation("Context SaveChanges failed while deleting support ticket");
                return serviceResponse;
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
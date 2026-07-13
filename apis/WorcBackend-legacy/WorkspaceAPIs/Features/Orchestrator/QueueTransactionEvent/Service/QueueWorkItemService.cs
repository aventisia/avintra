namespace WorkspaceAPIs.Services;

public class QueueTransactionEventService : IQueueTransactionEventService
{
    private readonly ILogger<QueueTransactionEventService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public QueueTransactionEventService(
        ILogger<QueueTransactionEventService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Retrieve the current user's identifier from the HTTP context.
        _userId = Guid.Parse(
            httpContextAccessor.HttpContext?.User?.FindFirstValue("uid") ??
            Guid.Empty.ToString());

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves all events associated with the specified queue transaction.
    public async Task<ServiceResponse<IEnumerable<QueueTransactionEventDto>>> GetQueueTransactionEventsAsync(Guid queueTransactionId)
    {
        // Initialize the service response with a default failure message.
        var serviceResponse = new ServiceResponse<IEnumerable<QueueTransactionEventDto>>
        {
            Data = null,
            Message = "Failed to retrieve queue transaction events. Please try again later."
        };

        try
        {
            // Retrieve all events associated with the specified queue transaction.
            var queueTransactionEvents = await _unitOfWork.QueueTransactionEventRepo
                .GetByConditionAsync(w => w.QueueTransactionId == queueTransactionId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .OrderBy(o => o.CreatedOn)
                .AsNoTracking()
                .ToListAsync();

            // Build the successful response.
            serviceResponse.Data = queueTransactionEvents.Adapt<IEnumerable<QueueTransactionEventDto>>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue transaction events retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An error occurred while retrieving queue transaction events for QueueTransactionId: {QueueTransactionId}.",
                queueTransactionId);
        }

        return serviceResponse;
    }


    // Retrieves the details of a specific queue transaction event.
    public async Task<ServiceResponse<QueueTransactionEventDto>> GetQueueTransactionEventByIdAsync(Guid queueTransactionEventId)
    {
        // Initialize the service response with a default failure message.
        var serviceResponse = new ServiceResponse<QueueTransactionEventDto>
        {
            Data = null,
            Message = "Failed to retrieve the queue transaction event. Please try again later."
        };

        try
        {
            // Retrieve the queue transaction event with its related data.
            var queueTransactionEvent = await _unitOfWork.QueueTransactionEventRepo
                .GetByConditionAsync(w => w.Id == queueTransactionEventId)
                .Include(i => i.CreatedByUser)
                .Include(i => i.LastModifiedByUser)
                .AsNoTracking()
                .SingleOrDefaultAsync();

            // Ensure the queue transaction event exists.
            if (queueTransactionEvent == null)
            {
                _logger.LogInformation(
                    "Queue transaction event with ID {QueueTransactionEventId} was not found.",
                    queueTransactionEventId);

                serviceResponse.Message = "Queue transaction event not found.";
                return serviceResponse;
            }

            // Map the entity to the DTO and build the successful response.
            serviceResponse.Data = queueTransactionEvent.Adapt<QueueTransactionEventDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue transaction event retrieved successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An error occurred while retrieving queue transaction event {QueueTransactionEventId}.",
                queueTransactionEventId);
        }

        return serviceResponse;
    }

    // Creates a new queue transaction event.
    public async Task<ServiceResponse<QueueTransactionEventDto>> CreateQueueTransactionEventAsync(
        QueueTransactionEventDto queueTransactionEventDto)
    {
        // Initialize the service response with a default failure message.
        var serviceResponse = new ServiceResponse<QueueTransactionEventDto>
        {
            Data = null,
            Message = "Failed to create the queue transaction event. Please try again later."
        };

        try
        {
            // Ensure the associated queue transaction exists.
            var queueTransaction = await _unitOfWork.QueueTransactionRepo
                .GetByConditionAsync(w => w.Id == queueTransactionEventDto.QueueTransactionId)
                .SingleOrDefaultAsync();

            if (queueTransaction == null)
            {
                _logger.LogWarning(
                    "Queue transaction with ID {QueueTransactionId} was not found.",
                    queueTransactionEventDto.QueueTransactionId);

                serviceResponse.Message = "Queue transaction not found.";
                return serviceResponse;
            }

            // Trim dto' string props
            queueTransactionEventDto = TrimDtoStringPropsUtil.TrimDtoStringProps(queueTransactionEventDto);

            // Map the DTO to the entity.
            var queueTransactionEvent = queueTransactionEventDto.Adapt<QueueTransactionEvent>();

            // TODO: Replace string with a strongly typed object or JSON document (e.g., JsonDocument/JsonNode) the event payload schema is finalized.

            // Populate audit fields.
            queueTransactionEvent.CreatedByUserId = _userId;
            queueTransactionEvent.LastModifiedByUserId = _userId;

            // Persist the entity.
            await _unitOfWork.QueueTransactionEventRepo.InsertAsync(queueTransactionEvent);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "Failed to create queue transaction event for QueueTransactionId {QueueTransactionId}.",
                    queueTransactionEventDto.QueueTransactionId);

                return serviceResponse;
            }

            // Build the successful response.
            serviceResponse.Data = queueTransactionEvent.Adapt<QueueTransactionEventDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue transaction event created successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An error occurred while creating a queue transaction event for QueueTransactionId {QueueTransactionId}.",
                queueTransactionEventDto.QueueTransactionId);
        }

        return serviceResponse;
    }

    // Updates an existing queue transaction event.
    public async Task<ServiceResponse<QueueTransactionEventDto>> UpdateQueueTransactionEventAsync(QueueTransactionEventDto queueTransactionEventDto)
    {
        // Initialize the service response with a default failure message.
        var serviceResponse = new ServiceResponse<QueueTransactionEventDto>
        {
            Data = null,
            Message = "Failed to update the queue transaction event. Please try again."
        };

        try
        {
            // Retrieve the queue transaction event.
            var queueTransactionEvent = await _unitOfWork.QueueTransactionEventRepo
                .GetByConditionAsync(w => w.Id == queueTransactionEventDto.Id)
                .SingleOrDefaultAsync();

            // Ensure the queue transaction event exists.
            if (queueTransactionEvent == null)
            {
                _logger.LogWarning(
                    "Queue transaction event with ID {QueueTransactionEventId} was not found.",
                    queueTransactionEventDto.Id);

                serviceResponse.Message = "Queue transaction event not found.";
                return serviceResponse;
            }

            // Trim dto' string props
            queueTransactionEventDto = TrimDtoStringPropsUtil.TrimDtoStringProps(queueTransactionEventDto);

            // Update the entity only when values have changed.
            if (queueTransactionEvent.EventType != queueTransactionEventDto.EventType)
            {
                queueTransactionEvent.EventType = queueTransactionEventDto.EventType;
            }

            // TODO: Replace string with a strongly typed object or JSON document (e.g., JsonDocument/JsonNode) the event payload schema is finalized.
            if (queueTransactionEvent.Data != queueTransactionEventDto.Data)
            {
                queueTransactionEvent.Data = queueTransactionEventDto.Data;
            }

            if (queueTransactionEvent.QueueTransactionId != queueTransactionEventDto.QueueTransactionId)
            {
                queueTransactionEvent.QueueTransactionId = queueTransactionEventDto.QueueTransactionId;
            }

            // Update audit information.
            queueTransactionEvent.LastModifiedByUserId = _userId;
            queueTransactionEvent.LastModifiedOn = DateTimeOffset.UtcNow;

            // Persist the changes.
            _unitOfWork.QueueTransactionEventRepo.Update(queueTransactionEvent);

            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "Failed to update queue transaction event {QueueTransactionEventId}.",
                    queueTransactionEventDto.Id);

                return serviceResponse;
            }

            // Build the successful response.
            serviceResponse.Data = queueTransactionEvent.Adapt<QueueTransactionEventDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue transaction event updated successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An error occurred while updating queue transaction event {QueueTransactionEventId}.",
                queueTransactionEventDto.Id);
        }

        return serviceResponse;
    }

    // Deletes a queue transaction event.
    public async Task<ServiceResponse<bool>> DeleteQueueTransactionEventAsync(Guid queueTransactionEventId)
    {
        // Initialize the service response with a default failure message.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete the queue transaction event. Please try again."
        };

        try
        {
            // Retrieve the queue transaction event to be deleted.
            var queueTransactionEvent = await _unitOfWork.QueueTransactionEventRepo
                .GetByConditionAsync(w => w.Id == queueTransactionEventId)
                .SingleOrDefaultAsync();

            // Ensure the queue transaction event exists.
            if (queueTransactionEvent == null)
            {
                _logger.LogWarning(
                    "Queue transaction event with ID {QueueTransactionEventId} was not found for deletion.",
                    queueTransactionEventId);

                serviceResponse.Message = "Queue transaction event not found.";
                return serviceResponse;
            }

            // Delete the queue transaction event.
            _unitOfWork.QueueTransactionEventRepo.Delete(queueTransactionEvent);

            // Persist the changes.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogError(
                    "Failed to delete queue transaction event {QueueTransactionEventId}.",
                    queueTransactionEventId);

                return serviceResponse;
            }

            // Build the successful response.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Queue transaction event deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "An error occurred while deleting queue transaction event {QueueTransactionEventId}.",
                queueTransactionEventId);
        }

        return serviceResponse;
    }

    // Deletes multiple queue transaction events.
    public async Task<ServiceResponse<bool>> DeleteQueueTransactionEventsAsync(List<Guid> queueTransactionEventIds)
    {
        // Initialize the service response with a default failure message.
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete queue transaction events. Please try again."
        };

        try
        {
            // Retrieve the queue transaction events that match the provided identifiers.
            var queueTransactionEvents = await _unitOfWork.QueueTransactionEventRepo
                .GetByConditionAsync(w => queueTransactionEventIds.Contains(w.Id))
                .ToListAsync();

            // Ensure there are queue transaction events to delete.
            if (!queueTransactionEvents.Any())
            {
                _logger.LogInformation("No queue transaction events were found for deletion.");

                serviceResponse.Message = "No queue transaction events were found for the specified identifiers.";
                return serviceResponse;
            }

            // Delete the queue transaction events.
            _unitOfWork.QueueTransactionEventRepo.Delete(queueTransactionEvents);

            // Persist the changes.
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to delete the selected queue transaction events.");
                return serviceResponse;
            }

            // Build the successful response.
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = $"{queueTransactionEvents.Count} queue transaction event(s) deleted successfully.";
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while deleting queue transaction events.");
        }

        return serviceResponse;
    }
}
namespace MLModelBuilderAPIs.Services;

public class ConversationHistoryService : IConversationHistoryService
{
    private readonly ILogger<ConversationHistoryService> _logger;
    private readonly IUnitOfWork _unitOfWork;
    private readonly Guid _userId;

    public ConversationHistoryService(
        ILogger<ConversationHistoryService> logger,
        IUnitOfWork unitOfWork,
        IHttpContextAccessor httpContextAccessor)
    {
        // Attempt to retrieve the user's ID and tenant ID from the JWT claims
        _userId = Guid.TryParse(httpContextAccessor.HttpContext?.User?.FindFirstValue("uid"), out var userId) ? userId : Guid.Empty;

        _logger = logger;
        _unitOfWork = unitOfWork;
    }

    // Retrieves a list of conversation history entries associated with a specific ML model.
    public async Task<ServiceResponse<IEnumerable<ConversationHistoryDto>>> GetConversationHistoriesByMLModelIdAsync(Guid mlModelId, Guid? conversationId)
    {
        // Initialize response with default failure state
        var serviceResponse = new ServiceResponse<IEnumerable<ConversationHistoryDto>>
        {
            Data = null,
            Message = "Failed to retrieve conversation histories. Please try again."
        };

        try
        {
            // Fetch conversation history entries linked to the given ML model Id
            var conversationHistories = await _unitOfWork.ConversationHistoryRepo
                .GetByConditionAsync(w =>
                    w.AIProjectId == mlModelId &&
                    (!conversationId.HasValue || w.ConversationId == conversationId)
                )
                .Include(i => i.AIProject)
                .ProjectToType<ConversationHistoryDto>()
                .ToListAsync();

            // Map data and prepare successful response
            serviceResponse.Data = conversationHistories;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversation history retrieved successfully";

            // Log success with details
            _logger.LogInformation($"Successfully retrieved {conversationHistories.Count} conversation entries for ML model with Id {mlModelId}");
        }
        catch (Exception ex)
        {
            // Log the exception with stack trace for debugging
            _logger.LogError(ex, $"Error occurred while retrieving conversation history for ML model with Id {mlModelId}");
        }

        // Return either success or failure response
        return serviceResponse;
    }

    // Retrieves a specific conversation history by its unique identifier.
    public async Task<ServiceResponse<ConversationHistoryDto>> GetConversationHistoryByIdAsync(Guid conversationHistoryId)
    {
        // Initialize response object with default
        var serviceResponse = new ServiceResponse<ConversationHistoryDto>
        {
            Data = null,
            Message = "Failed to retrieve conversation history. Please try again."
        };

        try
        {
            // Attempt to find the conversation history with the specified Id
            var conversationHistory = await _unitOfWork.ConversationHistoryRepo
                .GetByConditionAsync(w =>
                    w.Id == conversationHistoryId
                )
                .Include(i => i.AIProject)
                .SingleOrDefaultAsync();

            // If not found, log and return default response
            if (conversationHistory == null)
            {
                _logger.LogInformation($"Conversation history with Id {conversationHistoryId} not found.");
                serviceResponse.Message = "Cconversation history not found";
                return serviceResponse;
            }

            // If found, map entity to DTO and update response
            serviceResponse.Data = conversationHistory.Adapt<ConversationHistoryDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversation history retrieved successfully.";

            // Log success
            _logger.LogInformation($"Successfully retrieved conversation history with Id {conversationHistoryId}.");
        }
        catch (Exception ex)
        {
            // Log exception details
            _logger.LogError(ex, $"Error occurred while retrieving conversation history with Id {conversationHistoryId}.");
        }

        // Return the final response object
        return serviceResponse;
    }

    // Adds a new conversation message to an ML model's history.
    public async Task<ServiceResponse<ConversationHistoryDto>> InsertConversationHistoryAsync(ConversationHistoryDto conversationHistoryDto)
    {
        // Initialize response indicating failure by default
        var serviceResponse = new ServiceResponse<ConversationHistoryDto>
        {
            Data = null,
            Message = "Failed to add conversation history. Please try again."
        };

        try
        {
            // Clean string properties to remove leading/trailing whitespace
            conversationHistoryDto = TrimDtoStringPropsUtil.TrimDtoStringProps(conversationHistoryDto);

            // Map the DTO to the ConversationHistory entity model
            var newConversationHistory = conversationHistoryDto.Adapt<ConversationHistory>();

            // Insert the new entity in repository
            await _unitOfWork.ConversationHistoryRepo.InsertAsync(newConversationHistory);

            // Save changes to the database and verify success
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save the new conversation history to the database.");
                return serviceResponse;
            }

            // Prepare successful response with inserted entity mapped back to DTO
            serviceResponse.Data = newConversationHistory.Adapt<ConversationHistoryDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversation history added successfully";

            // Log the successful addition
            _logger.LogInformation($"Conversation history for ML model {newConversationHistory.AIProjectId} added successfully.");
        }
        catch (Exception ex)
        {
            // Log exception details
            _logger.LogError(ex, "Exception occurred while adding a conversation history.");
        }

        // Return the service response with success
        return serviceResponse;
    }

    // Updates an existing conversation history.
    public async Task<ServiceResponse<ConversationHistoryDto>> UpdateConversationHistoryAsync(ConversationHistoryDto conversationHistoryDto)
    {
        // Initialize response to failure state by default
        var serviceResponse = new ServiceResponse<ConversationHistoryDto>
        {
            Data = null,
            Message = "Failed to update conversation history. Please try again."
        };

        try
        {
            // First DB call: Retrieve the conversation history
            var conversationHistory = await _unitOfWork.ConversationHistoryRepo
                .GetByConditionAsync(w =>
                    w.Id == conversationHistoryDto.Id
                )
                .SingleOrDefaultAsync();

            // Check if the conversation history exists
            if (conversationHistory == null)
            {
                _logger.LogInformation($"Conversation history with Id {conversationHistoryDto.Id} not found for update.");
                serviceResponse.Message = "Conversation history not found.";
                return serviceResponse;
            }

            // Clean string properties on incoming DTO
            conversationHistoryDto = TrimDtoStringPropsUtil.TrimDtoStringProps(conversationHistoryDto);

            // Update entity properties from DTO (typically only editable fields)
            conversationHistory.Message = conversationHistoryDto.Message;

            // Mark entity as updated in repository
            _unitOfWork.ConversationHistoryRepo.Update(conversationHistory);

            // Save changes and check result
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to save updates for conversation history with Id {conversationHistory.Id}.");
                return serviceResponse;
            }

            // Prepare successful response
            serviceResponse.Data = conversationHistory.Adapt<ConversationHistoryDto>();
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversation history updated successfully.";

            _logger.LogInformation($"Conversation history with Id {conversationHistory.Id} updated successfully.");
        }
        catch (Exception ex)
        {
            // Log exception details
            _logger.LogError(ex, $"Exception occurred while updating conversation history with Id {conversationHistoryDto.Id}.");
        }

        // Return service response
        return serviceResponse;
    }

    // Deletes a conversation history permanently.
    public async Task<ServiceResponse<bool>> DeleteConversationHistoryAsync(Guid conversationHistoryId)
    {
        // Initialize response indicating failure by default
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete conversation history. Please try again."
        };

        try
        {
            // Retrieve the conversation history entity by Id
            var conversationHistory = await _unitOfWork.ConversationHistoryRepo
                .GetByConditionAsync(w =>
                    w.Id == conversationHistoryId
                )
                .SingleOrDefaultAsync();

            // If conversation history does not exist, return error response
            if (conversationHistory == null)
            {
                _logger.LogInformation($"Conversation history with Id {conversationHistoryId} does not exist.");
                serviceResponse.Message = "Conversation history does not exist.";
                return serviceResponse;
            }

            // Delete the conversation history entity from the repository
            _unitOfWork.ConversationHistoryRepo.Delete(conversationHistory);

            // Save changes and check result
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning($"Failed to save changes after deleting conversation history with Id {conversationHistoryId}.");
                return serviceResponse;
            }

            // Success response with true data
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversation history deleted successfully.";

            _logger.LogInformation($"Conversation history with Id {conversationHistoryId} deleted successfully.");
        }
        catch (Exception ex)
        {
            // Log exception details
            _logger.LogError(ex, $"Exception occurred while deleting conversation history with Id {conversationHistoryId}.");
        }

        // Return response indicating success
        return serviceResponse;
    }

    // Deletes multiple conversation history entries by a list of their unique identifiers.
    public async Task<ServiceResponse<bool>> DeleteMultipleConversationHistoriesAsync(IEnumerable<Guid> conversationHistoryIds)
    {
        // Initialize response object with default failure message
        var serviceResponse = new ServiceResponse<bool>
        {
            Data = false,
            Message = "Failed to delete conversation history entries. Please try again."
        };

        try
        {
            // Fetch all conversation history entries matching the given list of Ids
            var conversationHistories = await _unitOfWork.ConversationHistoryRepo
                .GetByConditionAsync(w => conversationHistoryIds.Contains(w.Id))
                .ToListAsync();

            // If no entries are found, log info and return response
            if (!conversationHistories.Any())
            {
                _logger.LogInformation("No conversation history entries found matching the provided IDs.");
                serviceResponse.Message = "No entries found to delete.";
                return serviceResponse;
            }

            // Delete all found entries using repository's bulk delete method
            _unitOfWork.ConversationHistoryRepo.Delete(conversationHistories);

            // Save changes to the database
            if (!await _unitOfWork.SaveAsync())
            {
                _logger.LogWarning("Failed to save deletion of multiple conversation history entries.");
                return serviceResponse;
            }

            // Set success values in response
            serviceResponse.Data = true;
            serviceResponse.StatusCode = 200;
            serviceResponse.Message = "Conversation history entries deleted successfully.";

            // Log the number of entries deleted
            _logger.LogInformation($"Successfully deleted {conversationHistories.Count} conversation history(ies).");
        }
        catch (Exception ex)
        {
            // Log the exception with stack trace
            _logger.LogError(ex, "Exception occurred while deleting multiple conversation history entries.");
        }

        // Return the final response
        return serviceResponse;
    }
}
